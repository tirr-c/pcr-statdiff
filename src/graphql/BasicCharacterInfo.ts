import { gql } from 'apollo-boost';

import { BasicCharacterInfo } from '../common-types';

import query from './queries/BasicCharacterInfo.gql';

export interface BasicCharacterInfoData {
    unit: BasicCharacterInfo | null;
}

export default query;
