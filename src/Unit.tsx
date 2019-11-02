import styled from 'astroturf';
import React from 'react';

import { reaction } from 'mobx';
import { observer } from 'mobx-react';

import { CharacterUnit, Equipment, PromotionLevel } from './common-types';
import { EquipmentItem, UnitItem } from './state';

import EquipmentList from './EquipmentList';
import Stars from './Stars';

const buildUnitUrl = (id: number, rarity: number) => {
    const realId = id + (rarity >= 3 ? 30 : 10);
    return new URL(`/icons/unit/${realId}.png`, STATIC_BASE_URL).toString();
};

const UnitContainer = styled.div`
    width: 500px;
    margin-bottom: 12px;
`;

const UnitData = styled.div`
    display: flex;
    margin-bottom: 12px;
    > img {
        width: 96px;
        height: 96px;
    }
`;

const UnitDetail = styled.form`
    margin-left: 8px;
`;

interface Props {
    unit: UnitItem;
}

export default observer(function Unit(props: Props) {
    const { unit } = props;
    const [rarityDraft, setRarityDraft] = React.useState(1);
    const [rankDraft, setRankDraft] = React.useState('1');
    const [levelDraft, setLevelDraft] = React.useState('1');
    const isDraft = unit.rarity !== rarityDraft || String(unit.rank) !== rankDraft || String(unit.level) !== levelDraft;

    React.useEffect(() => {
        return reaction(
            () => unit.loading,
            loading => {
                if (!loading) {
                    setRarityDraft(unit.rarity);
                    setRankDraft(String(unit.rank));
                    setLevelDraft(String(unit.level));
                }
            },
        );
    }, [unit]);

    const handleRequery = React.useCallback(e => {
        e.preventDefault();
        const rarity = rarityDraft;
        const rank = Number(rankDraft);
        const level = Number(levelDraft);
        unit.updateOptions({ rarity, rank, level });
    }, [unit, rarityDraft, rankDraft, levelDraft]);

    const handleRankChange = React.useCallback(e => {
        setRankDraft(e.target.value);
    }, []);

    const handleLevelChange = React.useCallback(e => {
        setLevelDraft(e.target.value);
    }, []);

    const unitIconUrl = buildUnitUrl(unit.basicInfo.id, unit.rarity);
    return (
        <UnitContainer>
            <UnitData>
                <img key={unitIconUrl} src={unitIconUrl} />
                <UnitDetail onSubmit={handleRequery}>
                    <div>{unit.basicInfo.name}</div>
                    <Stars value={rarityDraft} max={5} onChange={setRarityDraft} />
                    <div>RANK <input type="number" min={1} value={rankDraft} onChange={handleRankChange} /></div>
                    <div>레벨 <input type="number" min={1} value={levelDraft} onChange={handleLevelChange} /></div>
                    <input type="submit" disabled={unit.loading || !isDraft} value={unit.loading ? '로드 중' : '적용'} />
                </UnitDetail>
            </UnitData>
            <EquipmentList equipments={unit.equipments} />
        </UnitContainer>
    );
});
