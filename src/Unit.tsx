import styled from 'astroturf';
import React from 'react';

import { CharacterUnit, Equipment, PromotionLevel } from './common-types';

import Stars from './Stars';

const buildUnitUrl = (id: number, rarity: number) => {
    const realId = id + (rarity >= 3 ? 30 : 10);
    return new URL(`/icons/unit/${realId}.png`, 'https://ames-static.tirr.dev').toString();
};
const buildEquipmentUrl = (id: number, flag: boolean) => {
    const path = flag ? `/icons/equipment/${id}.png` : `/icons/equipment/invalid/${id}.png`;
    return new URL(path, 'https://ames-static.tirr.dev').toString();
};

const UnitContainer = styled.div`
    width: 500px;
`;

const UnitData = styled.div`
    display: flex;
    margin-bottom: 12px;
    > img {
        width: 96px;
        height: 96px;
    }
`;

const UnitDetail = styled.div`
    margin-left: 8px;
`;

const Equipments = styled.ul`
    margin: 0;
    padding: 0;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 8px;
    grid-auto-rows: min-content;
`;

const Equipment = styled.li`
    display: flex;
    align-items: center;
    list-style: none;

    > img {
        width: 64px;
        height: 64px;
    }
`;

const EquipmentDetail = styled.div`
    margin-left: 8px;
`;

const EquipmentName = styled.div`
    font-size: 0.9em;
`;

interface EquipmentViewProps {
    equipment: Equipment;
    index: number;
    flag: boolean;
    enhanceLevel: number;
    onEquipmentChange?(index: number, flag: boolean, enhanceLevel: number): void;
}

function getMaxEnhance(promotionLevel: PromotionLevel) {
    switch (promotionLevel) {
        case PromotionLevel.Blue: return 0;
        case PromotionLevel.Bronze: return 1;
        case PromotionLevel.Silver: return 3;
        case PromotionLevel.Gold:
        case PromotionLevel.Purple: return 5;
    }
}

function EquipmentView(props: EquipmentViewProps) {
    const { equipment, index, flag, enhanceLevel, onEquipmentChange } = props;
    const handlePromotionLevelChange = React.useCallback((level: number) => {
        onEquipmentChange && onEquipmentChange(index, flag, level);
    }, [index, flag, onEquipmentChange]);
    const handleFlagToggle = React.useCallback(() => {
        onEquipmentChange && onEquipmentChange(index, !flag, enhanceLevel);
    }, [index, flag, enhanceLevel, onEquipmentChange]);

    return (
        <Equipment>
            <img src={buildEquipmentUrl(equipment.id, flag)} onClick={handleFlagToggle} />
            <EquipmentDetail>
                <EquipmentName>{equipment.name}</EquipmentName>
                <Stars
                    value={enhanceLevel}
                    max={getMaxEnhance(equipment.promotionLevel)}
                    onChange={handlePromotionLevelChange}
                />
            </EquipmentDetail>
        </Equipment>
    );
}

interface Props {
    unit: CharacterUnit;
    rarity: number;
    rank: number;
    equipmentFlags: boolean[];
    enhanceLevels: number[];
    onEquipmentChange?(index: number, flag: boolean, enhanceLevel: number): void;
}

export default function Unit(props: Props) {
    const { unit, rarity, rank, equipmentFlags, enhanceLevels, onEquipmentChange } = props;
    return (
        <UnitContainer>
            <UnitData>
                <img src={buildUnitUrl(unit.id, rarity)} />
                <UnitDetail>
                    <div>{unit.name} ★{rarity}</div>
                    <div>RANK {rank}</div>
                </UnitDetail>
            </UnitData>
            <Equipments>
                {unit.equipments.map((equipment, idx) => (
                    <EquipmentView
                        key={idx}
                        equipment={equipment}
                        index={idx}
                        flag={equipmentFlags[idx]}
                        enhanceLevel={enhanceLevels[idx]}
                        onEquipmentChange={onEquipmentChange}
                    />
                ))}
            </Equipments>
        </UnitContainer>
    );
}
