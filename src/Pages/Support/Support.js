import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router';
import SupportLayout from '../../containers/layouts/SupportLayout/SupportLayout';
import config from '../../shared/identifiers';
import routes from '../../shared/routes';
import Basic from './Basic/Basic';
import Double from './Double/Double';
import Payments from './Payments/Payments';
import Srq from './Srq/Srq';
import backgroundImage from '../../assets/backgrounds/support-wave.svg';
import Solutions from './Solutions/Solutions';

const Support = (props) => (
    <SupportLayout routes={props.routes} backgroundImage={backgroundImage}>
        <Switch>
            <Route path={routes.support.srq.path}>
                <Srq />
            </Route>
            <Route path={routes.support.basic.path}>
                <Basic name={props.fullName} />
            </Route>
            <Route exact path={routes.support.doubleOpened.path}>
                <Double type={config.double.opened} />
            </Route>
            <Route exact path={routes.support.doubleClosed.path}>
                <Double type={config.double.closed} />
            </Route>
            <Route path={routes.support.payments.path}>
                <Payments />
            </Route>
            <Route path={routes.support.solutions.path}>
                <Solutions />
            </Route>
            <Route path={routes.support.main.path} exact />
        </Switch>
    </SupportLayout>
);
const mapStateToProps = (state) => ({
    isAuthenticated: !!state.auth.token,
    fullName: state.auth.fullName,
});
export default connect(mapStateToProps, null)(Support);
