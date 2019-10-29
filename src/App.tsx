import React from 'react';

import { observer } from 'mobx-react';

import { State } from './state';
import UnitStatItem from './UnitStatItem';

interface Props {
    state: State;
}

export default observer(function App(props: Props) {
    React.useEffect(() => {
        props.state.addUnit('토모');
    }, []);

    return (
        <>{props.state.units.map((unit, idx) => <UnitStatItem key={idx} unit={unit} />)}</>
    );
});
