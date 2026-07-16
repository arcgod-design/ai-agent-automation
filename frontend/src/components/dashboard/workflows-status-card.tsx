import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApi } from '@/hooks/useApi';
import { useState } from 'react';
import { Activity, Loader2 } from 'lucide-react';

type Task = {
  _id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  metadata?: {
    runningBy?: string;
  };
};

type LiveStatusResponse = {
  ok: boolean;
  running: Task[];
  failed: Task[];
};

export function WorkflowsStatusCard() {
  const { data, loading } = useApi<LiveStatusResponse>('/dashboard/live-status');
  const [tab, settab] = useState('Running');

  const tasks = tab === 'Running' ? (data?.running ?? []) : (data?.failed ?? []);
  const hasData = tasks.length > 0;

  return (
    <Card className="flex flex-col p-5 sm:p-6 border-border/15 bg-card/20 shadow-sm rounded-xl h-full min-h-75">
      <div className="mb-6">
        <h3 className="text-base font-medium text-foreground/90 tracking-tight">
          Workflows Status
        </h3>
        <div className="flex items-center gap-6 mt-5 border-b border-border/10 px-1">
          <div
            className={`pb-2.5 border-b-2 ${tab === 'Running' ? 'border-primary' : 'border-transparent'} text-sm font-medium text-foreground/90 -mb-px transition-all duration-300 ease-in-out`}
            onClick={() => settab('Running')}
          >
            Running
          </div>
          <div
            className={`pb-2.5 border-b-2 ${tab === 'Failed' ? 'border-primary' : 'border-transparent'} text-sm font-medium text-foreground/90 -mb-px transition-all duration-300 ease-in-out`}
            onClick={() => settab('Failed')}
          >
            Failed
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center opacity-40">
        <div className="w-full space-y-7">
          {hasData ? (
            tasks.map((item: Task) => (
              <div key={item._id} className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground/90">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground/60">
                      {item.metadata?.runningBy ?? 'System'}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-medium ${
                      tab === 'Running' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {tab}
                  </span>
                </div>

                <Progress value={100} className="h-1 bg-muted/30" />
              </div>
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-border/20 bg-muted/5">
              <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                <Activity className="size-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground/80">
                {tab === 'Running' ? 'No running workflows' : 'No failed workflows'}
              </p>

              <p className="text-xs text-muted-foreground/50 mt-1">
                {tab === 'Running'
                  ? 'There are no workflows currently running.'
                  : 'No workflow failures have been detected.'}
              </p>
            </div>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground/60 mt-8 tracking-wider">
          Status data unavailable
        </span>
      </div>
    </Card>
  );
}
