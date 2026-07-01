const { createStepResult } = require('../utils/stepResult');
const { interpolate } = require('../utils/interpolate');

async function execute(step, context, agent, validatedStepId, timeoutMs) {
  const config = step.config || step;
  const inputPayload = interpolate(config.input || '', context);
  const responseMsg = `Agent ${agent?.name || 'Unknown'} (Role: ${agent?.role || 'None'}) acknowledged request: ${inputPayload}`;

  return createStepResult({
    stepId: validatedStepId,
    type: 'agent_call',
    input: inputPayload,
    output: responseMsg,
    success: true
  });
}

module.exports = { execute };