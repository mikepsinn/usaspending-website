/**
 * ProgramActivityFilter.jsx
 * Created by michaelbray on 4/14/17.
 */

import React from 'react';
import { OrderedSet } from 'immutable';

import * as Icons from 'components/sharedComponents/icons/Icons';
import ProgramActivityItem from './ProgramActivityItem';

const propTypes = {
    selectedProgramActivities: React.PropTypes.instanceOf(OrderedSet),
    programActivities: React.PropTypes.array,
    updateFilter: React.PropTypes.func,
    noResults: React.PropTypes.bool
};

const defaultShown = 10;

const defaultState = {
    shown: defaultShown,
    shownType: 'more'
};

export default class ProgramActivityFilter extends React.Component {
    constructor(props) {
        super(props);

        this.state = defaultState;

        this.toggleValue = this.toggleValue.bind(this);
    }

    toggleShownAmount() {
        const programActivities = this.props.programActivities;

        let updatedState = defaultState;

        if (this.state.shownType === 'more') {
            updatedState = {
                shown: Object.keys(programActivities).length,
                shownType: 'fewer'
            };
        }

        this.setState(updatedState);
    }

    toggleValue(event) {
        this.props.updateFilter(event.target.value);
    }

    generateProgramActivityItems(programActivities) {
        const activities = [];

        programActivities.forEach((programActivity) => {
            if (activities.length < this.state.shown) {
                const label = `${programActivity.code} - ${programActivity.name}`;
                const checked = this.props.selectedProgramActivities.includes(programActivity.id);

                if (activities.length <= this.state.shown
                    && (programActivity.name !== null && programActivity.name !== '')) {
                    activities.push(
                        <ProgramActivityItem
                            key={programActivity.id}
                            programActivityID={programActivity.id}
                            label={label}
                            checked={checked}
                            toggleValue={this.toggleValue} />);
                }
            }
        });

        if (activities.length === 0 && this.props.noResults) {
            activities.push("There are no Program Activities for this Federal Account.");
        }

        return activities;
    }

    generateToggleButton() {
        const programActivities = this.props.programActivities;
        let toggleButton = null;

        if (programActivities && Object.keys(programActivities).length > 10) {
            const remaining = Object.keys(programActivities).length - this.state.shown;
            let shownStatement = '';
            let arrow = '';

            if (remaining === 0) {
                shownStatement = this.state.shownType;
                arrow = (<Icons.AngleUp alt={`See ${shownStatement}`} />);
            }
            else {
                shownStatement = `${remaining} ${this.state.shownType}`;
                arrow = (<Icons.AngleDown alt={`See ${shownStatement}`} />);
            }

            toggleButton = (<button
                className="see-more account-program-activity-toggle-button"
                onClick={this.toggleShownAmount.bind(this)}
                title={`See ${shownStatement}`}>
                See {shownStatement}
                &nbsp; {arrow}
            </button>);
        }

        return toggleButton;
    }

    render() {
        const items = this.generateProgramActivityItems(this.props.programActivities);
        const toggleButton = this.generateToggleButton();

        return (
            <div className="account-program-activity-filter search-filter">
                <ul className="program-activities">
                    { items }
                </ul>
                {toggleButton}
            </div>
        );
    }
}

ProgramActivityFilter.propTypes = propTypes;
