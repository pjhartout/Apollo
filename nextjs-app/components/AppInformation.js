import { useState, useContext } from "react";
import styles from "./AppInformation.module.scss";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";
import { Context } from "./Store";

import { withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import { MdExpandMore } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AccordionSummaryWithStyles = withStyles({
  content: {
    marginTop: 20,
    marginBottom: 20,
  },
})(AccordionSummary);

const AppInformation = () => {
  const [_, dispatch] = useContext(Context);

  const [expanded, setExpanded] = useState("panel1");

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <>
      <div className={styles.infoContainer}>
        <div className={styles.contentContainer}>
          <h1>Welcome to Apollo.</h1>
          <p>
            Welcome to <i>Apollo</i>, the app that enables you to intuitively
            identify genes by setting your own expression criteria!
          </p>
          <p>
            This is a tutorial to help get you started with your gene analysis
            by walking you through a typical workflow.
          </p>
          <h2>For what tasks can Apollo be used?</h2>
          <p>
            Suppose you want to answer the question: "What are the genes that
            differ the most in terms of expression in gliomas (a type of brain
            cancer) compared to normal brain tissues?" Using <em>Apollo</em>,
            you can answer this question in 3 easy steps by leveraging the data
            from tissues gene expression profiles from the&nbsp;
            <a href="https://www.gtexportal.org/home/" target="_blank">
              GTEx{" "}
            </a>
            and/or&nbsp;
            <a
              href="https://www.cancer.gov/about-nci/organization/ccg/research/structural-genomics/tcga"
              target="_blank"
            >
              TCGA
            </a>{" "}
            data sets.
          </p>
          <h2>Example Use Case</h2>
          <p>
            Let's walk through a typical analysis that you can perform with this
            web application. For the sake of this example, we select gene
            expression data from healthy brain cortex and a primary glioma
            tumor.
          </p>
          <br />
          <p className={styles.note}>
            <b>Note &emsp;</b> For the sake of simplicity we only select two
            brain tissues in this example. This type of analysis is possible
            with any number of tissues of any part of the body, depending on
            your needs.
          </p>
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
                {" "}
                <b>1. Select Tissues</b>
              </Typography>
            </AccordionSummaryWithStyles>
            <AccordionDetails>
              <Typography>
                We select gene expression data from healthy brain cortex and a
                primary glioma tumor. The resulting plots will look similar to
                the two plots below.
                <br />
                <figure className={styles.figure}>
                  <img
                    src="/screenshots/GTEx_unselected.jpg"
                    alt="GTEx_unselected"
                  />
                </figure>
                <figure className={styles.figure}>
                  <img
                    src="/screenshots/TCGA_unselected.jpg"
                    alt="TCGA_unselected"
                  />
                </figure>
                <br />
                We are interested in genes that are highly expressed in tumors
                but barely expressed in healthy tissues. We identify these genes
                by comparing the average expression of each gene for all samples
                collected for the selected tissues. A possible use case for such
                an analysis is identifying targets for oncotherapeutic
                strategies.
                <br />
                <br />
                Depending on how stringent you want your selection to be, you
                could end up with parameters that resembles the following:
                <br />
                <figure className={styles.figure}>
                  <img
                    src="/screenshots/GTEx_selected.jpg"
                    alt="GTEx_selected"
                  />
                </figure>
                <figure className={styles.figure}>
                  <img
                    src="/screenshots/TCGA_selected.jpg"
                    alt="TCGA_selected"
                  />
                </figure>
                <br />
                <div className={styles.note}>
                  {" "}
                  <b>Note &emsp;</b> The data used in this web application
                  allows for the identification of radically different gene
                  expressions. Therefore it is recommended <i>not</i> to select
                  overlapping regions of tissues which do not belong to the same
                  source dataset. For instance, it is not advised to look at
                  cortex tissue expression within the range of 0-10 log
                  <sub>2</sub>
                  (TPM) and cancerous tissue within the range 5-15 log
                  <sub>2</sub> (TPM). A more sound combination of ranges would
                  be 0-1 log<sub>2</sub>(TPM) for the cortex and 8-15 log
                  <sub>2</sub>
                  (TPM) for the glioma tissue. Unavoidable batch effects and
                  differences in sample processing between the two datasets
                  might lead to misleading results.
                </div>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel2"}
            onChange={handleChange("panel2")}
            className={styles.root}
          >
            <AccordionSummaryWithStyles
              expandIcon={<MdExpandMore />}
              aria-controls="panel2bh-content"
              id="panel2bh-header"
            >
              <Typography className={styles.heading}>
                {" "}
                <b>2. Select Gene Sets.</b>
              </Typography>
            </AccordionSummaryWithStyles>
            <AccordionDetails>
              <Typography>
                After selecting the appropriate ranges, you can identify genes
                highly expressed in tumors but barely expressed in healthy
                tissue by looking at the <i>intersection</i> of the two selected
                sets of genes.
                <br />
                <br />
                Directly comparing a large number of tissues may lead to an
                non-intuitive, cluttered set visualization. Tissues can be
                grouped to simplify the set visualization. Prior to computing
                the set visualization, you can indicate whether you want to take
                the intersection or the union of the genes within each group. By
                default, all selected tissues are grouped based on their
                respective source datasets (TCGA/GTEx) but it is possible to
                make any number of tissue groups, or group all tissues together.
                <br />
                <br />
                The set relationships are displayed using an Euler diagram,
                which is similar to a Venn diagram. Venn diagrams represent sets
                of elements (in this case genes) by a circle. The overlap of
                each circle represents the common elements of each of the sets.
                What distinguishes an Euler diagram from a Venn diagram is that
                the Euler diagram gives an area-proportional depiction of the
                size of the overlap of each set. This results in a more
                intuitive visualization of each of the sets and their respective
                overlap.
                <br />
                <br />
                This is the Euler diagram corresponding to the particular range
                of brain cortex and glioma gene expression profiles selected
                above:
                <br />
                <figure className={styles.figure}>
                  <img
                    src="/screenshots/Euler_unselected.jpg"
                    alt="Euler_unselected"
                  />
                </figure>
                <br />
                <i>Apollo</i> supports the analysis of sets containing up to
                1000 genes. Now, you can select the set interaction that you are
                interested in, which you can further analyze in the next step.
                In this tutorial, we select the following intersection:
                <br />
                <figure className={styles.figure}>
                  <img
                    src="/screenshots/Euler_selected.jpg"
                    alt="Euler_selected"
                  />
                </figure>
                <br />
                <div className={styles.note}>
                  <b>Note &emsp;</b> You can always go back to earlier steps of
                  the application to add or remove tissues, adjust gene
                  expression ranges, or change the gene set you want to look at.
                </div>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel3"}
            onChange={handleChange("panel3")}
            className={styles.root}
          >
            <AccordionSummaryWithStyles
              expandIcon={<MdExpandMore />}
              aria-controls="panel3bh-content"
              id="panel3bh-header"
            >
              <Typography className={styles.heading}>
                {" "}
                <b>3. Gene Analysis</b>
              </Typography>
            </AccordionSummaryWithStyles>
            <AccordionDetails>
              <Typography>
                Once a specific set of genes has been selected, you can carry
                out the following analyses:
                <ol>
                  <li className={styles.bullets}>
                    You can get general information about each of the genes in
                    the set including name, description and function and type of
                    gene (i.e. protein coding, miRNA, etc..).
                  </li>
                  <br />
                  <figure className={styles.figure}>
                    <img src="/screenshots/EnsemblAPI.jpg" alt="EnsemblAPI" />
                  </figure>
                  <br />
                  <li className={styles.bullets}>
                    For genes that encode proteins, <i>Apollo</i> provides known
                    information about known biological functions. This is useful
                    when drilling down the exact function and processes in which
                    the protein-coding gene partakes.
                    <br />
                    <br />
                    The figure below shows a few tables with detailed
                    information for a specific protein-coding gene.
                  </li>
                  <br />
                  <figure className={styles.figure}>
                    <img src="/screenshots/GeneInfoAPI.jpg" alt="GeneInfoAPI" />
                  </figure>
                  <br />

                  <li className={styles.bullets}>
                    Finally, you can conduct a gene set enrichment analysis on
                    the protein-coding genes that have been selected. This type
                    of analysis provides context regarding the mechanisms and
                    processes a subset of genes in the selection is involved in.
                    Examples of such processes are shown below:
                  </li>
                  <br />
                  <figure className={styles.figure}>
                    <img src="/screenshots/GSEA.jpg" alt="GSEA" />
                  </figure>
                  <br />
                </ol>
                That's it!
                <Button
                  key={0}
                  disabled={false}
                  onClick={() =>
                    dispatch({
                      type: "SET_VIEW",
                      payload: "select-tissues",
                    })
                  }
                  text={"Start by selecting tissues 🚀"}
                  title={"Start selecting tissues"}
                  className={styles.goToTissueSelection}
                />
              </Typography>
            </AccordionDetails>
          </Accordion>
          <p className={`${styles.note} ${styles.reproducibility}`}>
            <b>Reproducibility &emsp;</b> Once your analysis is complete, you
            can download the analysis configuration via the button in the
            navigation panel to the left. This allows you to share your analysis
            parameters with others, or resume your work by uploading it to the
            web application.
          </p>
          <h2>FAQs</h2>
          <h3>
            How does this workflow differ from differential gene expression?
          </h3>
          Apollo does not perform differential gene expression, so no <i>p</i>
          -value is to be expected. Rather, it computes a list of most radically
          differently expressed genes, i.e. genes that are, for instance, highly
          expressed in tumors, but barely expressed in healthy tissue, the
          boundaries of which are defined by the user.
          <h3>What is Apollo's intended audience?</h3>
          Apollo is created for (computational) biologists and students. It can
          be used for target gene identification, exploring the basics of gene
          expression using real life datasets. Apollo requires a basic
          understanding of molecular biology, and no programming experience.
        </div>
      </div>
    </>
  );
};

export default AppInformation;
