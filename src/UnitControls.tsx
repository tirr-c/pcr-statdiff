import styled from 'astroturf';
import React from 'react';

import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { Instance } from 'mobx-state-tree';

import { UnitItem } from './state';

import Stars from './Stars';

const Container = styled.form`
    margin-bottom: 12px;
    display: flex;

    @media (max-width: 516px) {
        display: block;
    }
`;

const Column = styled.div`
    flex: 1;

    & + & {
        margin-left: 8px;

        @media (max-width: 516px) {
            margin-left: 0;
            margin-top: 8px;
        }
    }

    > * + * {
        margin-top: 4px;
    }
`;

const Item = styled.div`
    display: flex;
    align-items: center;

    > :nth-child(1) {
        width: 64px;
        font-weight: bold;
    }

    > :nth-child(2) {
        flex: 1;
        margin-left: 8px;
    }
`;

interface Props {
    unit: Instance<typeof UnitItem>;
}

export default observer(function UnitControls(props: Props) {
    const { unit } = props;

    const [rarityDraft, setRarityDraft] = React.useState(() => unit.rarity);
    const [rankDraft, setRankDraft] = React.useState(() => String(unit.rank));
    const [levelDraft, setLevelDraft] = React.useState(() => String(unit.level));
    const isDraft = unit.rarity !== rarityDraft || String(unit.rank) !== rankDraft || String(unit.level) !== levelDraft;

    const handleRankChange = React.useCallback(e => {
        setRankDraft(e.target.value);
    }, []);

    const handleLevelChange = React.useCallback(e => {
        setLevelDraft(e.target.value);
    }, []);

    const handleRequery = React.useCallback(e => {
        e.preventDefault();
        const rarity = rarityDraft;
        const rank = Number(rankDraft);
        const level = Number(levelDraft);
        unit.setOptions({ rarity, rank, level });
    }, [unit, rarityDraft, rankDraft, levelDraft]);

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

    return (
        <Container onSubmit={handleRequery}>
            <Column>
                <Item>
                    <span>레어도</span>
                    <Stars value={rarityDraft} max={5} onChange={setRarityDraft} />
                </Item>
            </Column>
            <Column>
                <Item>
                    <span>RANK</span>
                    <input value={rankDraft} onChange={handleRankChange} />
                </Item>
                <Item>
                    <span>레벨</span>
                    <input value={levelDraft} onChange={handleLevelChange} />
                </Item>
                <input type="submit" disabled={!isDraft} value="적용" />
            </Column>
        </Container>
    );
});
