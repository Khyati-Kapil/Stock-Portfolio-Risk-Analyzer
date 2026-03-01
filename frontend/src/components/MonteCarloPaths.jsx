import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

function MonteCarloPaths({ paths }) {
    const chartData = useMemo(() => {
        if (!paths || paths.length === 0) return [];

        const horizons = paths[0].length;
        const data = [];

        for (let day = 0; day < horizons; day++) {
            const dp = { day: `Day ${day + 1}` };
            paths.forEach((path, idx) => {
                dp[`path_${idx}`] = path[day] * 100; // Convert to percentage
            });
            data.push(dp);
        }
        return data;
    }, [paths]);

    if (!paths || paths.length === 0) {
        return (
            <div className="glass-card" style={{ marginTop: '1.5rem', height: '300px' }}>
                <h3 className="card-title">Monte Carlo Path Projections</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 40px)', color: 'var(--text-tertiary)', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                    No simulation data available.
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ marginTop: '1.5rem', height: '350px' }}>
            <h3 className="card-title">Monte Carlo 10-Day Projections (100 Sample Paths)</h3>
            <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="var(--text-tertiary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--text-tertiary)"
                            fontSize={12}
                            tickFormatter={(val) => `${val.toFixed(1)}%`}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-light)', borderRadius: '8px' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                            labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                            formatter={(value) => [`${value.toFixed(2)}%`, 'Return']}
                            labelFormatter={(label) => label}
                        />
                        {paths.map((_, idx) => (
                            <Line
                                key={`path_${idx}`}
                                type="monotone"
                                dataKey={`path_${idx}`}
                                stroke={`hsla(${Math.random() * 360}, 70%, 50%, 0.15)`}
                                strokeWidth={1}
                                dot={false}
                                activeDot={false}
                                isAnimationActive={true}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default MonteCarloPaths;
