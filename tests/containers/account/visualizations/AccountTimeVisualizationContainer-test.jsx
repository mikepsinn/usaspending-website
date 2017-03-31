/**
 * AccountTimeVisualizationContainer-test.jsx
 * Created by Kevin Li 3/27/17
 */

import React from 'react';
import { mount, shallow } from 'enzyme';
import { Set } from 'immutable';
import sinon from 'sinon';


import { AccountTimeVisualizationSectionContainer } from
    'containers/account/visualizations/AccountTimeVisualizationContainer';

import * as AccountHelper from 'helpers/accountHelper';
import { mockBalances, mockReduxAccount } from '../mockAccount';

// force Jest to use native Node promises
// see: https://facebook.github.io/jest/docs/troubleshooting.html#unresolved-promises
global.Promise = require.requireActual('promise');

const fetchDataSpy = sinon.spy(AccountTimeVisualizationSectionContainer.prototype, 'fetchData');

// mock the child component by replacing it with a function that returns a null element
jest.mock('components/account/visualizations/time/AccountTimeVisualizationSection', () =>
    jest.fn(() => null));

const mockAccountHelper = (functionName, event, expectedResponse) => {
    jest.useFakeTimers();
    // override the specified function
    AccountHelper[functionName] = jest.fn(() => {
        // Axios normally returns a promise, replicate this, but return the expected result
        const networkCall = new Promise((resolve, reject) => {
            process.nextTick(() => {
                if (event === 'resolve') {
                    resolve({
                        data: expectedResponse
                    });
                }
                else {
                    reject({
                        data: expectedResponse
                    });
                }
            });
        });

        return {
            promise: networkCall,
            cancel: jest.fn()
        };
    });
};

const unmockAccountHelper = () => {
    jest.useRealTimers();
    jest.unmock('helpers/accountHelper');
};

const defaultFilters = {
    dateType: 'fy',
    fy: new Set(),
    startDate: null,
    endDate: null
};

describe('AccountTimeVisualizationSectionContainer', () => {
    it('should load data on mount', () => {
        mockAccountHelper('fetchTasBalanceTotals', 'resolve', mockBalances.outlay);

        mount(<AccountTimeVisualizationSectionContainer
            reduxFilters={defaultFilters}
            account={mockReduxAccount} />);

        jest.runAllTicks();

        expect(fetchDataSpy.callCount).toEqual(1);
        fetchDataSpy.reset();
    });

    it('should reload data when the filters change', () => {
        mockAccountHelper('fetchTasBalanceTotals', 'resolve', mockBalances.outlay);

        const container = mount(<AccountTimeVisualizationSectionContainer
            reduxFilters={defaultFilters}
            account={mockReduxAccount} />);

        jest.runAllTicks();

        expect(fetchDataSpy.callCount).toEqual(1);

        container.setProps({
            reduxFilters: Object.assign({}, defaultFilters, {
                dateType: 'dr'
            })
        });

        jest.runAllTicks();

        expect(fetchDataSpy.callCount).toEqual(2);
        fetchDataSpy.reset();
    });

    describe('parseBalances', () => {
        it('should parse the API responses and update the container state with series data', () => {
            const container = shallow(<AccountTimeVisualizationSectionContainer
                reduxFilters={defaultFilters}
                account={mockReduxAccount} />);

            container.instance().balanceRequests = [
                {
                    type: 'outlay'
                },
                {
                    type: 'budgetAuthority'
                },
                {
                    type: 'obligated'
                },
                {
                    type: 'unobligated'
                }
            ];

            container.instance().parseBalances([
                {
                    data: mockBalances.outlay
                },
                {
                    data: mockBalances.budgetAuthority
                },
                {
                    data: mockBalances.obligated
                },
                {
                    data: mockBalances.unobligated
                }
            ]);

            const expectedState = {
                groups: ['2017'],
                xSeries: [['2017']],
                ySeries: [[
                    [
                        parseFloat(mockReduxAccount.totals.budgetAuthority['2017']),
                        parseFloat(mockReduxAccount.totals.obligated['2017']),
                        parseFloat(-1 * mockReduxAccount.totals.outlay['2017'])
                    ]
                ]],
                loading: false
            };

            expect(container.state()).toEqual(expectedState);
        });
    });
});
