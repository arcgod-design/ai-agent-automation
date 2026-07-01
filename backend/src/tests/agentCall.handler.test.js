const { execute } = require('../agents/handlers/agentCall.handler');

describe('Agent Call Handler (A2A Phase 1)', () => {
  it('should acknowledge the delegated agent and input payload', async () => {
    const mockStep = {
      id: 'step_1',
      type: 'agent_call',
      config: {
        input: 'Analyze this data'
      }
    };

    const mockContext = { taskId: 'test-task-123' };
    const mockAgent = {
      _id: 'agent_456',
      name: 'Specialist Data Bot',
      role: 'Data Analyst'
    };

    const result = await execute(mockStep, mockContext, mockAgent, 'step_1', 30000);

    expect(result.success).toBe(true);
    expect(result.type).toBe('agent_call');
    expect(result.input).toBe('Analyze this data');
    expect(result.output).toContain('Specialist Data Bot');
    expect(result.output).toContain('Data Analyst');
  });

  it('should handle missing agent identity gracefully', async () => {
    const mockStep = { config: { input: 'Ping' } };
    const result = await execute(mockStep, {}, null, 'step_2', 30000);

    expect(result.success).toBe(true);
    expect(result.output).toContain('Unknown');
  });
});