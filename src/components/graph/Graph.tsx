import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import {
  CircularProgress,
  Card,
  Typography,
  makeStyles,
  Box,
} from "@material-ui/core";

import Title from "./Title";
import CustomTooltip, { timeFormatter } from "./Tooltip";

const useStyles = makeStyles({
  graphCard: {
    padding: "10px",
  },
});

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export default function Graph(props: any) {
  const classes = useStyles();

  const now = new Date();
  const month = now.getMonth();
  const monthInAPI = month + 1;
  const weekday = now.getDay(); // 0-6, 0 is Sunday in JS
  const weekdayInAPI = weekday === 0 ? 7 : weekday; // No Zero in API, 1-7, 1 is Monday
  const weekdayInMenu = weekdayInAPI - 1;

  const [monthChoice, setMonthChoice] = useState(month);
  const [weekdayChoice, setWeekdayChoice] = useState(weekdayInMenu);

  if (Object.keys(props.data).length < 12) {
    //Don't render if not enough data yet
    return <CircularProgress />;
  }
  // Add wrap around for the graph

  let data = props.data[monthInAPI][weekdayInAPI];

  if (monthChoice !== month || weekdayChoice !== weekdayInMenu) {
    const comparisonData = props.data[monthChoice + 1][weekdayChoice + 1];
    data = data.map((dp: any, i: number) => {
      return {
        comparison: comparisonData[i].carbon_intensity,
        ...dp,
      };
    });
  }

  const adjustedData = JSON.parse(JSON.stringify(data));
  const wrapAround = JSON.parse(JSON.stringify(adjustedData[0]));
  wrapAround.hour = 24;
  adjustedData.push(wrapAround);

  console.log(adjustedData);
  const renderLineChart = (
    <LineChart width={500} height={300} data={adjustedData}>
      <Line type="monotone" dataKey="carbon_intensity" stroke="#8884d8" />
      <Line type="monotone" dataKey="comparison" stroke="red" />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis
        dataKey="hour"
        tickFormatter={timeFormatter}
        type="number"
        interval="preserveStartEnd"
      />
      <YAxis
        label={{ value: "gC02/kWh", angle: -90, position: "insideLeft" }}
      />
      <Tooltip content={<CustomTooltip />} />
    </LineChart>
  );

  return (
    <Card className={classes.graphCard}>
      <Title
        setMonthChoice={setMonthChoice}
        setWeekdayChoice={setWeekdayChoice}
        monthChoice={monthChoice}
        weekdayChoice={weekdayChoice}
      />
      <br />
      {renderLineChart}
    </Card>
  );
}
