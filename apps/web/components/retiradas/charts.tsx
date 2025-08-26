import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, LineChart, Line, Legend, Cell } from "recharts";

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface MonthlyData {
  month: string;
  finalizados: number;
  pendentes: number;
  emAndamento: number;
  cycleTime: number;
}

interface CombinedBacklogEvolutionData {
  day: string;
  backlog: number;
  retiradas: number;
  backlogWithPrevious: number;
  sucessoWithPrevious: number;
  date: string;
}

interface ChartsProps {
  statusICareData: ChartData[];
  statusICareOriginalData: ChartData[];
  statusAtividadeData: ChartData[];
  monthlyData: MonthlyData[];
  tipoServicoData: ChartData[];
  modeloData: ChartData[];
  statusByModelData: ChartData[];
  combinedBacklogEvolutionData: CombinedBacklogEvolutionData[];
  referenceMonthName: string;
  referenceYear: number;
  statusICareWithTecnicoData: ChartData[];
  statusICareDetailedByTecnicoData: ChartData[];
  tecnicoFilter: string[];
}

export function Charts(props: ChartsProps) {
  const chartData = props.statusICareData && props.statusICareData.length > 0 
    ? props.statusICareData.filter(item => item.value > 0)
    : [
        { name: 'Finalizado', value: 45 },
        { name: 'Pendente', value: 25 },
        { name: 'Em Andamento', value: 30 }
      ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const chartDataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
    label: `${item.value} (${total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
          <p className="font-medium">{`${label}`}</p>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{`Quantidade: ${value}`}</p>
          <p className="text-slate-700 dark:text-slate-300">{`Percentual: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  const colorForStatus = (name: string): string => {
    const n = (name || "").toLowerCase();
    if (n.includes("backlog")) return "#f59e0b";
    if (n.includes("insucesso")) return "#ef4444";
    if (n.includes("sucesso")) return "#10b981";
    if (n.includes("cancel")) return "#f43f5e";
    return "#60a5fa";
  };

  const tickMain = { fontSize: 13, fontWeight: 600, fill: '#0f172a' } as const;
  const tickSmall = { fontSize: 11, fontWeight: 600, fill: '#0f172a' } as const;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status no iCare</CardTitle>
            <CardDescription>Status atual no iCare</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart 
                data={chartDataWithPercentage}
                margin={{ top: 30, right: 20, left: 20, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={72}
                  interval={0}
                  tick={tickMain}
                />
                <YAxis tick={tickMain} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" barSize={56}>
                  {chartDataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={colorForStatus(entry.name)} />
                  ))}
                  <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fontWeight: 700, fill: 'currentColor' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status iCare Detalhado</CardTitle>
            <CardDescription>Status detalhado no iCare</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const desiredOrder = [
                'Backlog > 60 Dias',
                'Backlog > 30 Dias', 
                'Backlog > 4 Dias',
                'Backlog ≤ 4 Dias',
                'Sucesso-Reuso',
                'Sucesso-Reversa',
                'Insucesso',
                'Cancelado'
              ];

              let originalData = props.statusICareOriginalData && props.statusICareOriginalData.length > 0 
                ? props.statusICareOriginalData.filter(item => item.value > 0)
                : [
                    { name: 'Backlog > 60 Dias', value: 5 },
                    { name: 'Backlog > 30 Dias', value: 8 },
                    { name: 'Backlog > 4 Dias', value: 10 },
                    { name: 'Backlog ≤ 4 Dias', value: 15 },
                    { name: 'Sucesso-Reuso', value: 25 },
                    { name: 'Sucesso-Reversa', value: 20 },
                    { name: 'Insucesso', value: 8 },
                    { name: 'Cancelado', value: 5 }
                  ];

              originalData = originalData.sort((a, b) => {
                const indexA = desiredOrder.indexOf(a.name);
                const indexB = desiredOrder.indexOf(b.name);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
              });

              const originalTotal = originalData.reduce((sum, item) => sum + item.value, 0);
              const originalDataWithPercentage = originalData.map(item => ({
                ...item,
                percentage: originalTotal > 0 ? ((item.value / originalTotal) * 100).toFixed(1) : '0',
                label: `${item.value} (${originalTotal > 0 ? ((item.value / originalTotal) * 100).toFixed(1) : '0'}%)`
              }));

              const OriginalCustomTooltip = ({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value;
                  const percentage = originalTotal > 0 ? ((value / originalTotal) * 100).toFixed(1) : '0';
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
                      <p className="font-medium">{`${label}`}</p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{`Quantidade: ${value}`}</p>
                      <p className="text-slate-700 dark:text-slate-300">{`Percentual: ${percentage}%`}</p>
                    </div>
                  );
                }
                return null;
              };

              return (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={originalDataWithPercentage}
                    margin={{ top: 30, right: 20, left: 20, bottom: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={78}
                      interval={0}
                      tick={tickMain}
                    />
                    <YAxis tick={tickMain} />
                    <Tooltip content={<OriginalCustomTooltip />} />
                    <Bar dataKey="value">
                      {originalDataWithPercentage.map((entry, index) => (
                        <Cell key={`cell-detailed-${index}`} fill={colorForStatus(entry.name)} />
                      ))}
                      <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fontWeight: 700, fill: 'currentColor' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Backlog e Retiradas Realizadas - {props.referenceMonthName} {props.referenceYear}</CardTitle>
          <CardDescription>Evolução diária completa incluindo backlog total, retiradas realizadas, backlog com atendimento anterior e sucessos com atendimento anterior</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart 
              data={props.combinedBacklogEvolutionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={tickSmall}
                interval={Math.floor(props.combinedBacklogEvolutionData.length / 10)}
              />
              <YAxis tick={tickMain} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const backlog = payload.find((p: any) => p.dataKey === 'backlog')?.value || 0;
                    const retiradas = payload.find((p: any) => p.dataKey === 'retiradas')?.value || 0;
                    const backlogWithPrevious = payload.find((p: any) => p.dataKey === 'backlogWithPrevious')?.value || 0;
                    const sucessoWithPrevious = payload.find((p: any) => p.dataKey === 'sucessoWithPrevious')?.value || 0;
                    const dateLabel = (payload[0] as any)?.payload?.date ?? label;
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
                        <p className="font-medium">{`Data: ${dateLabel}`}</p>
                        <p className="text-amber-600">{`Backlog Total: ${backlog} itens`}</p>
                        <p className="text-green-600">{`Retiradas Realizadas: ${retiradas} itens`}</p>
                        <p className="text-orange-600">{`Backlog c/ Atendimento Anterior: ${backlogWithPrevious} itens`}</p>
                        <p className="text-blue-600">{`Sucesso c/ Atendimento Anterior: ${sucessoWithPrevious} itens`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '16px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="backlog" 
                stroke="hsl(45 93% 47%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(45 93% 47%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(45 93% 47%)', strokeWidth: 2 }}
                name="Backlog Total"
              >
                <LabelList dataKey="day" position="top" style={{ fontSize: '10px', fontWeight: 600, fill: '#0f172a' }} />
              </Line>
              <Line 
                type="monotone" 
                dataKey="retiradas" 
                stroke="hsl(142 76% 36%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(142 76% 36%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(142 76% 36%)', strokeWidth: 2 }}
                name="Retiradas Realizadas"
              >
                <LabelList dataKey="day" position="top" style={{ fontSize: '10px', fontWeight: 600, fill: '#0f172a' }} />
              </Line>
              <Line 
                type="monotone" 
                dataKey="backlogWithPrevious" 
                stroke="hsl(25 95% 53%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(25 95% 53%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(25 95% 53%)', strokeWidth: 2 }}
                name="Backlog c/ Atendimento Anterior"
              >
                <LabelList dataKey="day" position="top" style={{ fontSize: '10px', fontWeight: 600, fill: '#0f172a' }} />
              </Line>
              <Line 
                type="monotone" 
                dataKey="sucessoWithPrevious" 
                stroke="hsl(217 91% 60%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(217 91% 60%)', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(217 91% 60%)', strokeWidth: 2 }}
                name="Sucesso c/ Atendimento Anterior"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status por Modelo</CardTitle>
            <CardDescription>Distribuição por modelo e status (Backlog, Sucesso, Insucesso)</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const raw = props.statusByModelData || [];
              if (raw.length === 0) {
                return <div className="flex items-center justify-center h-[300px] text-muted-foreground">Sem dados</div>;
              }
              const parse = (name: string) => {
                const [model, status] = name.split(' - ');
                return { model: model || 'OUTROS', status: status || 'Outros' };
              };
              const models = Array.from(new Set(raw.map(r => parse(r.name).model)));
              const byModel = models.map(m => {
                const b = raw.find(r => parse(r.name).model === m && parse(r.name).status === 'Backlog')?.value || 0;
                const s = raw.find(r => parse(r.name).model === m && parse(r.name).status === 'Sucesso')?.value || 0;
                const i = raw.find(r => parse(r.name).model === m && parse(r.name).status === 'Insucesso')?.value || 0;
                return { model: m, Backlog: b, Sucesso: s, Insucesso: i };
              });
              const CustomTooltipBasic = ({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
                      <p className="font-medium">{label}</p>
                      {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-slate-700 dark:text-slate-300">{`${p.name}: ${p.value}`}</p>
                      ))}
                    </div>
                  );
                }
                return null;
              };
              return (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byModel} margin={{ top: 20, right: 20, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="model" angle={-45} textAnchor="end" height={110} interval={0} tick={{ ...tickSmall, fontSize: 12 }} tickMargin={8} />
                    <YAxis tick={tickMain} />
                    <Tooltip content={<CustomTooltipBasic />} />
                    <Legend />
                    <Bar dataKey="Backlog" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="Sucesso" stackId="a" fill="#10b981" />
                    <Bar dataKey="Insucesso" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipo-Subtipo de Serviço (Entrantes no mês)</CardTitle>
            <CardDescription>Quantidade e percentual por tipo-subtipo com Data Criação no mês</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const raw = props.tipoServicoData || [];
              if (!raw || raw.length === 0) {
                return <div className="flex items-center justify-center h-[300px] text-muted-foreground">Sem dados</div>;
              }
              const total = raw.reduce((s, it) => s + (it.value || 0), 0);
              const data = raw.map(it => {
                const pct = total > 0 ? ((it.value / total) * 100).toFixed(1) : '0.0';
                return { name: it.name, value: it.value, pct, label: `${it.value} (${pct}%)` };
              });
              const CustomTooltipTipo = ({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const p0 = payload[0];
                  const pct = data.find(d => d.name === label)?.pct;
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
                      <p className="font-medium">{label}</p>
                      <p className="text-slate-700 dark:text-slate-300">Quantidade: {p0?.value || 0}</p>
                      <p className="text-slate-700 dark:text-slate-300">Percentual: {pct}%</p>
                    </div>
                  );
                }
                return null;
              };
              return (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} interval={0} tick={{ ...tickSmall, fontSize: 13 }} tickMargin={10} />
                    <YAxis tick={{ ...tickMain, fontSize: 13 }} />
                    <Tooltip content={<CustomTooltipTipo />} />
                    <Bar dataKey="value" fill="#60a5fa">
                      <LabelList dataKey="label" position="top" style={{ fontSize: '13px', fontWeight: 700 }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {props.tecnicoFilter && props.tecnicoFilter.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_2.25fr] gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status no iCare - Com Técnico</CardTitle>
              <CardDescription>Status filtrado por técnico - último atendimento preenchido</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const chartData = props.statusICareWithTecnicoData && props.statusICareWithTecnicoData.length > 0 
                  ? props.statusICareWithTecnicoData.filter(item => item.value > 0)
                  : [];

                if (chartData.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      Nenhum dado encontrado para o filtro selecionado
                    </div>
                  );
                }

                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                const chartDataWithPercentage = chartData.map(item => ({
                  ...item,
                  percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
                  label: `${item.value} (${total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)`
                }));

                const CustomTooltipTecnico = ({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
                        <p className="font-medium">{`${label}`}</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{`Quantidade: ${value}`}</p>
                        <p className="text-slate-700 dark:text-slate-300">{`Percentual: ${percentage}%`}</p>
                      </div>
                    );
                  }
                  return null;
                };

                return (
                  <>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart 
                        data={chartDataWithPercentage}
                        margin={{ top: 40, right: 20, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          tick={tickMain}
                        />
                        <YAxis tick={tickMain} />
                        <Tooltip content={<CustomTooltipTecnico />} />
                        <Bar dataKey="value" barSize={56}>
                          {chartDataWithPercentage.map((entry, index) => (
                            <Cell key={`cell-tech-${index}`} fill={colorForStatus(entry.name)} />
                          ))}
                          <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fontWeight: 700, fill: 'currentColor' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-600">
                            <th className="py-1 pr-2">Status</th>
                            <th className="py-1 pr-2">Quantidade</th>
                            <th className="py-1">Percentual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartDataWithPercentage.map((row, idx) => (
                            <tr key={`row-tech-${idx}`} className="border-t">
                              <td className="py-1 pr-2">
                                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colorForStatus(row.name) }} />
                                <span style={{ color: colorForStatus(row.name) }}>{row.name}</span>
                              </td>
                              <td className="py-1 pr-2">{row.value}</td>
                              <td className="py-1">{row.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Status Detalhado por Técnico</CardTitle>
              <CardDescription>Status detalhado separado por técnico - último atendimento</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const chartData = props.statusICareDetailedByTecnicoData && props.statusICareDetailedByTecnicoData.length > 0 
                  ? props.statusICareDetailedByTecnicoData.filter(item => item.value > 0)
                  : [];

                if (chartData.length === 0) {
                  return (
                    <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                      Nenhum dado encontrado para o filtro selecionado
                    </div>
                  );
                }

                const total = chartData.reduce((sum, item) => sum + item.value, 0);
                const chartDataWithPercentage = chartData.map(item => ({
                  ...item,
                  percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0',
                  label: `${item.value} (${total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'}%)`
                }));

                const DetailedCustomTooltip = ({ active, payload, label }: any) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return (
                      <div className="bg-white dark:bg-slate-900 border border-border rounded-lg p-3 shadow-lg text-slate-900 dark:text-slate-100">
                        <p className="font-medium">{`${label}`}</p>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{`Quantidade: ${value}`}</p>
                        <p className="text-slate-700 dark:text-slate-300">{`Percentual: ${percentage}%`}</p>
                      </div>
                    );
                  }
                  return null;
                };

                const count = chartDataWithPercentage.length;
                let barSize = 32;
                if (count > 24) barSize = 24;
                if (count > 36) barSize = 20;
                if (count > 48) barSize = 16;
                const dynamicWidth = Math.max(800, count * (barSize + 8));
                return (
                  <div className="overflow-x-auto mt-4">
                    <div className="flex justify-center">
                      <div style={{ width: '100%', minWidth: dynamicWidth }}>
                        <ResponsiveContainer width="100%" height={440}>
                          <BarChart 
                            data={chartDataWithPercentage}
                            margin={{ top: 30, right: 24, left: 64, bottom: 64 }}
                            barCategoryGap="4%"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-45}
                              textAnchor="end"
                              height={160}
                              interval={0}
                              tick={tickSmall}
                              padding={{ left: 48, right: 32 }}
                              tickMargin={14}
                            />
                            <YAxis tick={tickMain} />
                            <Tooltip content={<DetailedCustomTooltip />} />
                            <Bar dataKey="value" barSize={barSize} maxBarSize={Math.max(barSize + 2, 36)}>
                              {chartDataWithPercentage.map((entry, index) => (
                                <Cell key={`cell-tech-detailed-${index}`} fill={colorForStatus(entry.name)} />
                              ))}
                              <LabelList dataKey="label" position="top" style={{ fontSize: '12px', fontWeight: 700, fill: 'currentColor' }} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}


