"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/utils";
import { fetchRevenueReport } from "@/services/payments";

export default function RevenueChart() {
    const [report, setReport] = useState<{
        total: number;
        commission: number;
        series: Array<{ period: string; gross: number; commission: number }>;
    } | null>(null);

    useEffect(() => {
        let cancelled = false;

        const now = new Date();
        const from = new Date(now);
        from.setDate(now.getDate() - 29);

        fetchRevenueReport(from.toISOString(), now.toISOString(), "day")
            .then((data) => {
                if (cancelled) return;

                setReport({
                    total: data.totals.grossRevenue,
                    commission: data.totals.commissionEarned,
                    series: data.series.map((point) => ({
                        period: point.period,
                        gross: point.grossRevenue,
                        commission: point.commissionEarned,
                    })),
                });
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm dark:bg-zinc-900">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground">
                        Revenue
                    </p>

                    <h2 className="mt-1 text-3xl font-bold">
                        {report ? formatCurrency(report.total) : "-"}
                    </h2>

                    <p className="mt-1 text-sm text-emerald-600">
                        {report ? `${formatCurrency(report.commission)} platform commission` : "Last 30 days"}
                    </p>
                </div>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report?.series ?? []}>
                        <defs>
                            <linearGradient
                                id="revenue"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#22c55e"
                                    stopOpacity={0.5}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#22c55e"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis dataKey="period" />

                        <YAxis
                            width={80}
                            tickFormatter={(value: number) =>
                                formatCurrency(value)
                            }
                        />

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey="gross"
                            name="Gross revenue"
                            stroke="#22c55e"
                            strokeWidth={3}
                            fill="url(#revenue)"
                        />

                        <Area
                            type="monotone"
                            dataKey="commission"
                            name="Commission"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="transparent"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}