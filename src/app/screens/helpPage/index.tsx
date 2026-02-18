import React from "react";
import { Box, Container, Stack, Tabs } from "@mui/material";
import Typography from "@mui/material/Typography";
import Tab from "@mui/material/Tab";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import TabContext from "@mui/lab/TabContext";
import TabPanel from "@mui/lab/TabPanel";
import { useGlobals } from "../../hooks/useGlobals";
import { useLanguage } from "../../context/LanguageContext";
import "../../../css/help.css";
import "../../../css/mobile/help.css";
import { faq } from "../../../lib/data/faq";
import { terms } from "../../../lib/data/terms";
import useDeviceDetect from "../../hooks/useDeviceDetect";

export default function HelpPage() {
  const { authTable } = useGlobals();
  const device = useDeviceDetect();
  const { t } = useLanguage();
  const [value, setValue] = React.useState("0");

  /** HANDLERS **/
  const handleChange = (e: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  if (device === "mobile") {
    return (
      <div className="mobile-help-page">
        <Typography className="mobile-help-title">{t("helpTitle")}</Typography>
        <Box className="mobile-help-cards">
          <Box className="mobile-help-card">
            <Typography className="mobile-help-card-title">{t("helpLangTitle")}</Typography>
            <Typography className="mobile-help-card-desc">{t("helpLangDesc")}</Typography>
          </Box>
          <Box className="mobile-help-card">
            <Typography className="mobile-help-card-title">{t("helpAddCartTitle")}</Typography>
            <Typography className="mobile-help-card-desc">{t("helpAddCartDesc")}</Typography>
          </Box>
          <Box className="mobile-help-card">
            <Typography className="mobile-help-card-title">{t("helpCartTitle")}</Typography>
            <Typography className="mobile-help-card-desc">{t("helpCartDesc")}</Typography>
          </Box>
          <Box className="mobile-help-card">
            <Typography className="mobile-help-card-title">{t("helpOrderTitle")}</Typography>
            <Typography className="mobile-help-card-desc">{t("helpOrderDesc")}</Typography>
          </Box>
          <Box className="mobile-help-card">
            <Typography className="mobile-help-card-title">{t("helpSearchTitle")}</Typography>
            <Typography className="mobile-help-card-desc">{t("helpSearchDesc")}</Typography>
          </Box>
        </Box>
      </div>
    );
  } else {
  return (
    <div className={"help-page"}>
      <Container className={"help-container"}>
        <TabContext value={value}>
          <Box className={"help-menu"}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="lab API tabs example"
                className={"table_list"}
              >
                <Tab label={t("helpHowTo").toUpperCase()} value={"0"} />
                <Tab label="TERMS" value={"1"} />
                <Tab label="FAQ" value={"2"} />
                <Tab label="CONTACT" value={"3"} />
              </Tabs>
            </Box>
          </Box>
          <Stack>
            <Stack className={"help-main-content"}>
              <TabPanel value={"0"}>
                <Stack className={"rules-box"}>
                  <Box className={"rules-frame"}>
                    <p><strong>{t("helpLangTitle")}</strong>: {t("helpLangDesc")}</p>
                    <p><strong>{t("helpAddCartTitle")}</strong>: {t("helpAddCartDesc")}</p>
                    <p><strong>{t("helpCartTitle")}</strong>: {t("helpCartDesc")}</p>
                    <p><strong>{t("helpOrderTitle")}</strong>: {t("helpOrderDesc")}</p>
                    <p><strong>{t("helpSearchTitle")}</strong>: {t("helpSearchDesc")}</p>
                  </Box>
                </Stack>
              </TabPanel>
              <TabPanel value={"1"}>
                <Stack className={"rules-box"}>
                  <Box className={"rules-frame"}>
                    {terms.map((value, number) => {
                      return <p key={number}>{value}</p>;
                    })}
                  </Box>
                </Stack>
              </TabPanel>
              <TabPanel value={"2"}>
                <Stack className={"accordion-menu"}>
                  {faq.map((value, number) => {
                    return (
                      <Accordion key={number}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel1a-content"
                          id="panel1a-header"
                        >
                          <Typography>{value.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>{value.answer}</Typography>
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Stack>
              </TabPanel>
              <TabPanel value={"3"}>
                <Stack className={"admin-letter-box"}>
                  <Stack className={"admin-letter-container"}>
                    <Box className={"admin-letter-frame"}>
                      <span>Contact us!</span>
                      <p>Fill out below form to send a message!</p>
                    </Box>
                    <form
                      action={"#"}
                      method={"POST"}
                      className={"admin-letter-frame"}
                    >
                      <div className={"admin-input-box"}>
                        <label>Your name</label>
                        <input
                          type={"text"}
                          name={"memberNick"}
                          placeholder={"Type your name here"}
                        />
                      </div>
                      <div className={"admin-input-box"}>
                        <label>Your email</label>
                        <input
                          type={"text"}
                          name={"memberEmail"}
                          placeholder={"Type your email here"}
                        />
                      </div>
                      <div className={"admin-input-box"}>
                        <label>Message</label>
                        <textarea
                          name={"memberMsg"}
                          placeholder={"Your message"}
                        ></textarea>
                      </div>
                      <Box
                        display={"flex"}
                        justifyContent={"flex-end"}
                        sx={{ mt: "30px" }}
                      >
                        <Button type={"submit"} variant="contained">
                          Send
                        </Button>
                      </Box>
                    </form>
                  </Stack>
                </Stack>
              </TabPanel>
            </Stack>
          </Stack>
        </TabContext>
      </Container>
    </div>
    );
  }
}
