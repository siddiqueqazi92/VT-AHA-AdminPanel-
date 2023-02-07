import * as React from "react";
import { Card, CardHeader, CardContent } from "@material-ui/core";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTranslate } from "react-admin";
import { format, subDays, addDays, parseISO } from "date-fns";

import { Order } from "../types";

const lastDay = new Date();
const lastMonthDays = Array.from({ length: 30 }, (_, i) => subDays(lastDay, i));
const aMonthAgo = subDays(new Date(), 30);

const dateFormatter = (date) => new Date(date).toLocaleDateString();

const aggregateOrdersByDay = (orders) =>
  orders
    .filter((order) => order.status !== "cancelled")
    .reduce((acc, curr) => {
      const day = format(parseISO(curr.createdAt), "yyyy-MM-dd");
      if (!acc[day]) {
        acc[day] = 0;
      }
      //acc[day] += curr.total;
      acc[day] += 0;
      return acc;
    }, {});

const getRevenuePerDay = (orders) => {
  const daysWithRevenue = aggregateOrdersByDay(orders);
  return lastMonthDays.map((date) => ({
    date: date.getTime(),
    total: daysWithRevenue[format(date, "yyyy-MM-dd")] || 0,
  }));
};

const OrderChart = (props) => {
  const { orders } = props;
  const translate = useTranslate();
  if (!orders) return null;

  return (
    <Card>
      <CardHeader title={translate("pos.dashboard.month_history")} />
      <CardContent>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={getRevenuePerDay(orders)}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                name="Date"
                type="number"
                scale="time"
                domain={[addDays(aMonthAgo, 1).getTime(), new Date().getTime()]}
                tickFormatter={dateFormatter}
              />
              <YAxis dataKey="total" name="Revenue" unit="€" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value) =>
                  new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                  }).format(value)
                }
                labelFormatter={(label) => dateFormatter(label)}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                strokeWidth={2}
                fill="url(#colorUv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderChart;
