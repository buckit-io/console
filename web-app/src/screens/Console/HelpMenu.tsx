// This file is part of MinIO Console Server
// Copyright (c) 2023 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, { Fragment, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import get from "lodash/get";
import {
  AlertCloseIcon,
  Box,
  Button,
  HelpIcon,
  HelpIconFilled,
  IconButton,
  Tabs,
} from "mds";
import { useSelector } from "react-redux";
import { AppState, useAppDispatch } from "../../store";
import { setHelpTabName } from "../../systemSlice";
import { DocItem } from "./HelpMenu.types";
import HelpItem from "./HelpItem";
import MoreLink from "../../common/MoreLink";

const HelpMenuContainer = styled.div(({ theme }) => ({
  backgroundColor: get(theme, "bgColor", "#FFF"),
  position: "absolute",
  zIndex: "10",
  border: `${get(theme, "borderColor", "#E2E2E2")} 1px solid`,
  borderRadius: 4,
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 0px 10px",
  width: 754,
  "& .tabsPanels": {
    padding: "15px 0 0",
  },
  "& .helpContainer": {
    maxHeight: 400,
    overflowY: "auto",
    "& .helpItemBlock": {
      padding: 5,
      "&:hover": {
        backgroundColor: get(
          theme,
          "buttons.regular.hover.background",
          "#E6EAEB",
        ),
      },
    },
  },
}));

const HelpMenu = () => {
  const helpTopics = require("../Console/helpTopics.json");

  const [helpItems, setHelpItems] = useState<DocItem[]>([]);
  const [headerDocs, setHeaderDocs] = useState<string | null>(null);
  const [helpMenuOpen, setHelpMenuOpen] = useState<boolean>(false);

  const systemHelpName = useSelector(
    (state: AppState) => state.system.helpName,
  );

  const helpTabName = useSelector(
    (state: AppState) => state.system.helpTabName,
  );

  const toggleHelpMenu = () => {
    setHelpMenuOpen(!helpMenuOpen);
  };
  const dispatch = useAppDispatch();

  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setHelpMenuOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const wrapperRef = useRef<HTMLDivElement>(null);
  useOutsideAlerter(wrapperRef);

  useEffect(() => {
    const helpTopic = helpTopics[systemHelpName] || helpTopics.help;
    const docs = helpTopic.docs;

    setHeaderDocs(docs.header);
    setHelpItems(docs.links);

    if (helpTabName !== "docs") {
      dispatch(setHelpTabName("docs"));
    }
  }, [systemHelpName, helpTabName, dispatch, helpTopics]);

  const helpContent = (
    <Box className={"helpContainer"}>
      {headerDocs && (
        <div style={{ paddingLeft: 16, paddingRight: 16 }}>
          <div>
            <ReactMarkdown>{`${headerDocs}`}</ReactMarkdown>
          </div>
          <div style={{ borderBottom: "1px solid #dedede" }} />
        </div>
      )}
      {helpItems &&
        helpItems.map((aHelpItem, idx) => (
          <Box className={"helpItemBlock"} key={`help-item-${aHelpItem}`}>
            <HelpItem item={aHelpItem} displayImage={false} />
          </Box>
        ))}
      <div style={{ padding: 16 }}>
        <MoreLink
          text={"Visit Buckit Documentation"}
          link={"https://buckit.sh/docs/"}
          color={"#3874A6"}
        />
      </div>
    </Box>
  );
  return (
    <Fragment>
      {helpMenuOpen && (
        <HelpMenuContainer ref={wrapperRef}>
          <Tabs
            options={[
              {
                tabConfig: { label: "Documentation", id: "docs" },
                content: helpContent,
              },
            ]}
            currentTabOrPath={helpTabName}
            onTabClick={(item) => dispatch(setHelpTabName(item))}
            optionsInitialComponent={
              <Box sx={{ margin: "10px 10px 10px 15px" }}>
                <HelpIconFilled
                  style={{ color: "#3874A6", width: 16, height: 16 }}
                />
              </Box>
            }
            optionsEndComponent={
              <Box sx={{ marginRight: 15 }}>
                <IconButton
                  onClick={() => {
                    setHelpMenuOpen(false);
                  }}
                  size="small"
                >
                  <AlertCloseIcon style={{ color: "#919191", width: 12 }} />
                </IconButton>
              </Box>
            }
            horizontalBarBackground
            horizontal
          />
        </HelpMenuContainer>
      )}
      <Button
        id={systemHelpName ?? "help_button"}
        icon={<HelpIcon />}
        onClick={toggleHelpMenu}
      ></Button>
    </Fragment>
  );
};

export default HelpMenu;
