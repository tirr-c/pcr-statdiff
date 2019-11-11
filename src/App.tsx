import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { UnitStore } from './state';
import UnitStatItem from './UnitStatItem';

const NameForm = styled.form`
    margin-bottom: 16px;
`;

interface Props {
    state: Instance<typeof UnitStore>;
}

export default observer(function App(props: Props) {
    const { state } = props;
    const [name, setName] = React.useState('');

    const handleNameChange = React.useCallback(e => setName(e.target.value), []);
    const handleAddUnit = React.useCallback(e => {
        e.preventDefault();
        state.addUnit(name);
        setName('');
    }, [state, name]);

    return (
        <>
            <NameForm onSubmit={handleAddUnit}>
                <input placeholder="추가할 캐릭터 이름" value={name} onChange={handleNameChange} />
                <input type="submit" value="추가" />
            </NameForm>
            {props.state.units.map((unit, idx) => <UnitStatItem key={idx} unit={unit} />)}
        </>
    );
});
