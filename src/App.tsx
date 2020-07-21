import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

import {
  Box,
  Container,
  Typography,
  Link,
  makeStyles,
} from "@material-ui/core";

import Graph from "./components/Graph";
import { useTranslation } from "react-i18next";

interface DailyCarbonData {
  [key: string]: number;
  carbon_intensity: number;
}

const useStyles = makeStyles({
  copyright: {
    margin: "10px",
  },
});

function Copyright() {
  const classes = useStyles();
  return (
    <Container className={classes.copyright}>
      <Typography variant="body2" color="textSecondary" align="center">
        {"Copyright © "}
        <Link color="inherit" href="https://frasertooth.dev/">
          Fraser Tooth
        </Link>{" "}
        {new Date().getFullYear()}
        {"."}
      </Typography>
    </Container>
  );
}

function App() {
  const defaultDailyCarbon: DailyCarbonData[] = [{ carbon_intensity: 0 }];
  const [dailyCarbon, setDailyCarbon] = useState(defaultDailyCarbon);
  const { t, i18n } = useTranslation();
  const date = new Date();
  const hour = date.getHours();

  useEffect(() => {
    async function fetchData() {
      const result = await axios.post(
        "https://us-central1-japan-grid-carbon-api.cloudfunctions.net/daily_carbon_intensity",
        {
          utility: "tepco",
        }
      );

      const data: any[] = Object.keys(result.data).map((key) => {
        return result.data[key];
      });

      setDailyCarbon(data);
    }
    fetchData();
  }, []);

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t("theCarbonIs") + t("probably") + ":"}
        </Typography>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          style={{ display: "inline-block" }}
        >
          {Math.round(dailyCarbon[hour]?.carbon_intensity) || 0}
        </Typography>
        <Typography style={{ display: "inline-block" }}>gC02/kWh</Typography>
        <Graph data={dailyCarbon} />
        <Copyright />
      </Box>
    </Container>
  );
}

export default App;
