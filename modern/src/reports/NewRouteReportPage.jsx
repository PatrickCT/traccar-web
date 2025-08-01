/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from './components/ReportsMenu';

import ReplayPage from '../other/ReplayPage';
import useReportStyles from './common/useReportStyles';

const RouteReportPage = () => {
  const classes = useReportStyles();
  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportRoute']}>
      <div className={classes.container}>
        <ReplayPage />
      </div>
    </PageLayout>
  );
};

export default RouteReportPage;
