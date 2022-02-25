import { useState } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import { MdExpandMore } from "react-icons/md";
import styles from "./ExperimentalEvidenceCodes.module.scss";
import { withStyles } from "@material-ui/core/styles";

const AccordionSummaryWithStyles = withStyles({
  content: {
    marginTop: 20,
    marginBottom: 20,
  },
})(AccordionSummary);

const ExperimentalEvidenceCodes = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Accordion
      expanded={expanded === "panel1"}
      onChange={handleChange("panel1")}
      className={styles.root}
    >
      <AccordionSummaryWithStyles
        expandIcon={<MdExpandMore />}
        aria-controls="panel1bh-content"
        id="panel1bh-header"
      >
        <Typography className={styles.heading}>
          Experimental abbreviation code abbreviations
        </Typography>
      </AccordionSummaryWithStyles>
      <AccordionDetails>
        <Typography>
          <ul>
            <li> Inferred from Experiment (EXP) </li>
            <li> Inferred from Direct Assay (IDA) </li>
            <li> Inferred from Physical Interaction (IPI) </li>
            <li> Inferred from Mutant Phenotype (IMP) </li>
            <li> Inferred from Genetic Interaction (IGI) </li>
            <li> Inferred from Expression Pattern (IEP) </li>
            <li> Inferred from High Throughput Experiment (HTP)</li>
            <li> Inferred from High Throughput Direct Assay (HDA)</li>
            <li> Inferred from High Throughput Mutant Phenotype (HMP)</li>
            <li> Inferred from High Throughput Genetic Interaction (HGI)</li>
            <li> Inferred from High Throughput Expression Pattern (HEP)</li>
            <li> Inferred from Biological aspect of Ancestor (IBA)</li>
            <li> Inferred from Biological aspect of Descendant (IBD)</li>
            <li> Inferred from Key Residues (IKR)</li>
            <li> Inferred from Rapid Divergence (IRD)</li>
            <li> Inferred from Sequence or structural Similarity (ISS)</li>
            <li> Inferred from Sequence Orthology (ISO)</li>
            <li> Inferred from Sequence Alignment (ISA)</li>
            <li> Inferred from Sequence Model (ISM)</li>
            <li> Inferred from Genomic Context (IGC)</li>
            <li> Inferred from Reviewed Computational Analysis (RCA)</li>
            <li> Traceable Author Statement (TAS)</li>
            <li> Non-traceable Author Statement (NAS)</li>
            <li> Inferred by Curator (IC)</li>
            <li> No biological Data available (ND)</li>
            <li> Inferred from Electronic Annotation (IEA)</li>
          </ul>
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
};

export default ExperimentalEvidenceCodes;
