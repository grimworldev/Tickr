import { Head } from '@inertiajs/react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { dashboard } from '@/routes';

type Props = {
    summary: { today: number; week: number; month: number; activeCount: number };
    revenueTrend: { date: string; total: number }[];
    revenueByPaymentMethod: { payment_method: string; total: number }[];
    revenueByCategory: { category: string; total: number }[];
};

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444'];

function SummaryCard({ label, value, isCurrency = true }: { label: string; value: number; isCurrency?: boolean }) {
    return (
        <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold">{isCurrency ? `₱${value.toFixed(2)}` : value}</p>
        </div>
    );
}

export default function Dashboard({ summary, revenueTrend, revenueByPaymentMethod, revenueByCategory }: Props) {
    console.log(revenueByPaymentMethod)
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <SummaryCard label="Today" value={summary.today} />
                    <SummaryCard label="This Week" value={summary.week} />
                    <SummaryCard label="This Month" value={summary.month} />
                    <SummaryCard label="Active Vehicles" value={summary.activeCount} isCurrency={false} />
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                    <h2 className="mb-4 font-semibold">Revenue Trend (Last 7 Days)</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <h2 className="mb-4 font-semibold">Revenue by Payment Method</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={revenueByPaymentMethod} dataKey="total" nameKey="payment_method" outerRadius={80} label>
                                    {revenueByPaymentMethod.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <h2 className="mb-4 font-semibold">Revenue by Category</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={revenueByCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#22c55e" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};