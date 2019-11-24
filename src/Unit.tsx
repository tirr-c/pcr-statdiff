import styled from 'astroturf';
import React from 'react';

import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { UnitItem } from './state';

import EquipmentControl from './EquipmentControl';
import EquipmentIcons from './EquipmentIcons';
import EquipmentList from './EquipmentList';
import UnitControls from './UnitControls';

const UnitContainer = styled.div`
    width: 500px;
    margin-right: 12px;
    margin-bottom: 12px;
`;

const UnitData = styled.div`
`;

const UnitTitle = styled.div`
    margin-bottom: 8px;
`;

const UnitDetail = styled.div`
    display: flex;
    align-items: stretch;

    > img {
        width: 96px;
        height: 96px;
    }

    > * + * {
        margin-left: 8px;
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

const UnitTaskList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: right;
`;

const ControlsWrapper = styled.div`
    margin-top: 12px;
`;

interface Props {
    unit: Instance<typeof UnitItem>;
}

export default observer(function Unit(props: Props) {
    const { unit } = props;
    const [showControls, setShowControls] = React.useState(false);

    const toggleShowControls = React.useCallback(() => setShowControls(value => !value), []);

    return (
        <UnitContainer>
            <UnitData>
                <UnitTitle>
                    <strong>{unit.basicInfo.name}</strong> ★{unit.rarity} RANK{unit.rank} Lv. {unit.level}
                </UnitTitle>
                <UnitDetail>
                    <img key={unit.iconId} src={unit.iconUrl} />
                    {unit.detail != null && <EquipmentIcons equipments={unit.detail.equipments} />}
                    <Spacer />
                    <UnitTaskList>
                        <button type="button" onClick={unit.remove}>캐릭터 삭제</button>
                        <Spacer />
                        <button type="button" onClick={toggleShowControls}>
                            {showControls ? '수정 끝' : '수정'}
                        </button>
                    </UnitTaskList>
                </UnitDetail>
            </UnitData>
            {showControls && unit.detail != null && (
                <ControlsWrapper>
                    <UnitControls unit={unit} />
                    <EquipmentList equipments={unit.detail.equipments} />
                    <EquipmentControl unitDetail={unit.detail} />
                </ControlsWrapper>
            )}
        </UnitContainer>
    );
});
