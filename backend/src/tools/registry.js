// backend/src/tools/registry.js
const { fork } = require("child_process");
const path = require("path");

/**
 * Centralized dynamic tool dictionary tracking mapping properties to sandboxed files and execution methods.
 */
const toolRegistryMap = {
  email: { toolName: "emailTool", functionName: "sendMail" },
  file: { toolName: "fileTool", functionName: "handleAction" },
  browser: { toolName: "browserTool", functionName: "handleAction" },
  hackernews: { toolName: "hackerNewsTool", functionName: "fetchNews" },
  slack_tool: { toolName: "slackTool", functionName: "postMessage" },
  github_tool: { toolName: "githubTool", functionName: "processEvent" }
};

/**
 * Checks if a workflow step type matches a registered sandboxed tool.
 * @param {string} type 
 * @returns {boolean}
 */
function hasTool(type) {
  if (!type) return false;
  return !!toolRegistryMap[type.toLowerCase()];
}

/**
 * Dynamic Tool Dispatcher executing tasks under a uniform tool contract interface.
 */
async function dispatchTool(type, step, context) {
  const config = toolRegistryMap[type.toLowerCase()];
  if (!config) {
    throw new Error(`Execution Contract Violation: Missing tool registration for type '${type}'`);
  }

  // Determine the correct target method inside the sandboxed file dynamically
  let targetFunction = config.functionName;
  let executionArgs = [step, context];

  const lowerType = type.toLowerCase();
  if (lowerType === "file" || lowerType === "browser") {
    // Dynamically match the sub-action method (e.g. 'write', 'append', 'read', 'screenshot', 'evaluate')
    targetFunction = (step.action || "read").toLowerCase();
    
    // Pass the required position-based arguments that the underlying tools expect
    if (lowerType === "file") {
      const requestedPath = step.path || `stepName_${step.name}_TaskId_${context.taskId}.txt`;
      const content = step.content || "";
      executionArgs = targetFunction === "read" ? [requestedPath] : [requestedPath, content];
    } else if (lowerType === "browser") {
      const url = step.url || "";
      if (targetFunction === "screenshot") {
        const relativeOutPath = `screenshot_${context.taskId}_${Date.now()}.png`;
        executionArgs = [url, { path: relativeOutPath }];
      } else if (targetFunction === "evaluate") {
        const userCode = step.code || 'return document.title;';
        executionArgs = [url, userCode];
      }
    }
  } else if (lowerType === "email") {
    // Format the email explicit parameter object expected by emailTool.sendMail
    targetFunction = "sendMail";
    executionArgs = [{
      to: step.to || "",
      subject: step.subject || "",
      text: step.text || "",
      html: step.html || ""
    }];
  }

  // Passing arguments cleanly down to the underlying sandbox process boundary matching the run specification contract
  return await runToolInSandbox(config.toolName, targetFunction, executionArgs);
}

/**
 * Executes a tool in a separate process container for security/isolation.
 */
function runToolInSandbox(toolName, functionName, args = []) {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, "sandboxWorker.js");

    const uid = process.env.TOOL_SANDBOX_UID ? Number(process.env.TOOL_SANDBOX_UID) : undefined;
    const gid = process.env.TOOL_SANDBOX_GID ? Number(process.env.TOOL_SANDBOX_GID) : undefined;
    const timeoutMs = process.env.TOOL_EXECUTION_TIMEOUT_MS ? Number(process.env.TOOL_EXECUTION_TIMEOUT_MS) : 30000;

    const allowedEnv = {
      IS_SANDBOX: "true"
    };

    const SYSTEM_ENV_VARS = ["PATH", "HOME", "USER", "NODE_ENV", "PWD"];
    for (const key of SYSTEM_ENV_VARS) {
      if (process.env[key] !== undefined) {
        allowedEnv[key] = process.env[key];
      }
    }

    const TOOL_CONFIG_VARS = [
      "FILE_BASE_DIR",
      "PUPPETEER_HEADLESS",
      "MAIL_HOST",
      "MAIL_PORT",
      "MAIL_USER",
      "MAIL_PASS",
      "MAIL_FROM",
      "EMAIL_HOST",
      "EMAIL_PORT",
      "EMAIL_USER",
      "EMAIL_PASS",
      "EMAIL_FROM"
    ];
    for (const key of TOOL_CONFIG_VARS) {
      if (process.env[key] !== undefined) {
        allowedEnv[key] = process.env[key];
      }
    }

    const forkOpts = {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
      execArgv: ["--max-old-space-size=256"],
      env: allowedEnv
    };

    if (uid !== undefined && !isNaN(uid)) {
      forkOpts.uid = uid;
    }
    if (gid !== undefined && !isNaN(gid)) {
      forkOpts.gid = gid;
    }

    const child = fork(workerPath, [], forkOpts);
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        try {
          child.kill("SIGKILL");
        } catch (e) {}
        reject(new Error(`Tool execution timed out after ${timeoutMs}ms.`));
      }
    }, timeoutMs);

    child.on("message", (response) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);

      if (response && response.success) {
        resolve(response.result);
      } else {
        reject(new Error(response ? response.error : "Unknown execution error"));
      }
    });

    child.on("error", (err) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });

    child.on("exit", (code) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(`Sandbox worker exited with code ${code}`));
      } else {
        resolve(null);
      }
    });

    child.send({ toolName, functionName, args });
  });
}

module.exports = { 
  runToolInSandbox,
  hasTool,
  dispatchTool
};