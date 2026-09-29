import React from 'react';
import { DnaInteractiveLab } from '../DnaInteractiveLab';
import { GeneModel } from './GeneModel';
import { RnaModel } from './RnaModel';
import { ProteinModel } from './ProteinModel';
import { ReplicationModel } from './ReplicationModel';
import { TranscriptionModel } from './TranscriptionModel';
import { TranslationModel } from './TranslationModel';
import { GeneMutationModel } from './GeneMutationModel';
import { MendelModel } from './MendelModel';
import { ChromosomeModel } from './ChromosomeModel';
import { ChromosomeSetModel } from './ChromosomeSetModel';
import { MitosisModel } from './MitosisModel';
import { MeiosisModel } from './MeiosisModel';
import { SexDeterminationModel } from './SexDeterminationModel';
import { GeneticLinkageModel } from './GeneticLinkageModel';
import { ChromosomalMutationModel } from './ChromosomalMutationModel';

interface TopicModelRendererProps {
  topicId: string;
}

export const TopicModelRenderer: React.FC<TopicModelRendererProps> = ({ topicId }) => {
  switch (topicId) {
    case 'dna':
      return <DnaInteractiveLab />;
    case 'gene':
      return <GeneModel />;
    case 'rna':
      return <RnaModel />;
    case 'protein':
      return <ProteinModel />;
    case 'dna_replication':
      return <ReplicationModel />;
    case 'transcription':
      return <TranscriptionModel />;
    case 'translation':
      return <TranslationModel />;
    case 'gene_mutation':
      return <GeneMutationModel />;
    case 'mendel':
    case 'genetic_laws':
      return <MendelModel />;
    case 'chromosome':
      return <ChromosomeModel />;
    case 'chromosome_set':
      return <ChromosomeSetModel />;
    case 'mitosis':
      return <MitosisModel />;
    case 'meiosis':
      return <MeiosisModel />;
    case 'sex_determination':
      return <SexDeterminationModel />;
    case 'genetic_linkage':
      return <GeneticLinkageModel />;
    case 'chromosomal_mutation':
      return <ChromosomalMutationModel />;
    default:
      return <DnaInteractiveLab />;
  }
};
