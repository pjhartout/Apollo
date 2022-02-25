import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Context } from "../components/Store";

import Head from "next/head";

import Layout from "../components/Layout";
import NavBar from "../components/NavBar";
import StatusBar from "../components/StatusBar";

import AppInformationView from "../views/AppInformationView";
import GenesAnalysisView from "../views/GenesAnalysisView";
import SelectTissuesView from "../views/SelectTissuesView";
import SelectSetsView from "../views/SelectSetsView";
import TooManySelectedGenesView from "../views/TooManySelectedGenesView";

import views from "../public/views/views.json";

const SPA = () => {
  const [state, _] = useContext(Context);

  const renderViewsSwitch = (view) => {
    switch (view) {
      case "app-information":
        return AppInformationView;
      case "select-tissues":
        return SelectTissuesView;
      case "select-sets":
        return SelectSetsView;
      case "genes-analysis":
        return GenesAnalysisView;
      case "too-many-selected-genes":
        return TooManySelectedGenesView();
      default:
        return AppInformationView;
    }
  };

  const renderViews = () => {
    return views.map((v, index) => {
      return (
        <div
          key={index}
          className={v.concat("-view")}
          style={{ display: state.view === v ? "block" : "none" }}
        >
          {renderViewsSwitch(v)}
        </div>
      );
    });
  };

  return (
    <Layout>
      <Head>
        <title>Apollo</title>
        <link rel="icon" href="favicon-apollo.ico" />
      </Head>

      <NavBar />

      <div className="pageContentContainer">{renderViews()}</div>
    </Layout>
  );
};

export default SPA;
