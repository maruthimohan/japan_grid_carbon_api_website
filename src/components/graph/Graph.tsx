import React, { useState } from "react";
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
import { useTranslation } from "react-i18next";

const useStyles = makeStyles({
  tooltip: {
    padding: "2px",
  },
  graphCard: {
    padding: "10px",
  },
});

const timeFormatter = (tick: number) => {
  if (tick === 24) return "00:00";
  if (tick < 10) return `0${tick}:00`;
  return `${tick}:00`;
};

function CustomTooltip({ payload, label, active }: any) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (active) {
    const dp = payload[0].payload;

    const dataBit = (data: any, label: string) => {
      return data ? (
        <div>
          {label + ": "}
          <Typography
            variant="h6"
            component="h1"
            gutterBottom
            style={{ display: "inline-block" }}
          >
            {Math.round(data)}
          </Typography>
          gC02/kWh
        </div>
      ) : (
        <div></div>
      );
    };

    return (
      <Card className={classes.tooltip}>
        <Box style={{ paddingLeft: "5px", paddingRight: "5px" }}>
          <Typography>{timeFormatter(dp.hour)}</Typography>
          {dataBit(dp.carbon_intensity, t("graph.today"))}
          {dataBit(dp.comparison, t("graph.compare"))}
        </Box>
      </Card>
    );
  }

  return null;
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