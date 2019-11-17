import styled from 'astroturf';
import React from 'react';

import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { UnitItem } from './state';

import EquipmentControl from './EquipmentControl';
import EquipmentList from './EquipmentList';
import Stars from './Stars';

const UnitContainer = styled.div`
    width: 500px;
    margin-bottom: 12px;
`;

const UnitData = styled.div`
    margin-bottom: 12px;
`;

const UnitTitle = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    > img {
        width: 96px;
        height: 96px;
    }
`;

const Spacer = styled.div`
    flex: 1;
`;

const UnitName = styled.div`
    margin-left: 8px;
    > * + * {
        margin-top: 4px;
    }
`;

const UnitDetail = styled.form`
    display: block;
`;

const UnitParams = styled.div`
    display: flex;

    & input[type="number"] {
        width: 50px;
    }
`;

interface Props {
    unit: Instance<typeof UnitItem>;
}

export default observer(function Unit(props: Props) {
    const { unit } = props;
    const [rarityDraft, setRarityDraft] = React.useState(() => unit.rarity);
    const [rankDraft, setRankDraft] = React.useState(() => String(unit.rank));
    const [levelDraft, setLevelDraft] = React.useState(() => String(unit.level));
    const isDraft = unit.rarity !== rarityDraft || String(unit.rank) !== rankDraft || String(unit.level) !== levelDraft;

    React.useEffect(() => {
        if (!unit.loading) {
            setRarityDraft(unit.rarity);
            setRankDraft(String(unit.rank));
            setLevelDraft(String(unit.level));
        }
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
        unit.setOptions({ rarity, rank, level });
    }, [unit, rarityDraft, rankDraft, levelDraft]);

    const handleRankChange = React.useCallback(e => {
        setRankDraft(e.target.value);
    }, []);

    const handleLevelChange = React.useCallback(e => {
        setLevelDraft(e.target.value);
    }, []);

    return (
        <UnitContainer>
            <UnitData>
                <UnitDetail onSubmit={handleRequery}>
                    <UnitTitle>
                        <img key={unit.iconId} src={unit.iconUrl} />
                        <UnitName>
                            <strong>{unit.basicInfo.name}</strong>
                            <Stars value={rarityDraft} max={5} onChange={setRarityDraft} />
                        </UnitName>
                        <Spacer />
                        <button type="button" onClick={unit.remove}>삭제</button>
                    </UnitTitle>
                    <UnitParams>
                        <div>RANK <input type="number" maxLength={2} min={1} value={rankDraft} onChange={handleRankChange} /></div>
                        <div>레벨 <input type="number" maxLength={3} min={1} value={levelDraft} onChange={handleLevelChange} /></div>
                        <input type="submit" disabled={unit.loading || !isDraft} value={unit.loading ? '로드 중' : '적용'} />
                    </UnitParams>
                </UnitDetail>
            </UnitData>
            {unit.detail != null && (
                <>
                    <EquipmentList equipments={unit.detail.equipments} />
                    <EquipmentControl unitDetail={unit.detail} />
                </>
            )}
        </UnitContainer>
    );
});
