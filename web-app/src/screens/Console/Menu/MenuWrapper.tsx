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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Menu } from "mds";
import { AppState, useAppDispatch } from "../../../store";
import { validRoutes } from "../valid-routes";
import { menuOpen } from "../../../systemSlice";
import { selFeatures } from "../consoleSlice";
import { getLogoApplicationVariant, getLogoVar } from "../../../config";
import { useLocation, useNavigate } from "react-router-dom";
import BuckitLogo from "../../../components/BuckitLogo";

const MenuWrapper = () => {
  const dispatch = useAppDispatch();
  const features = useSelector(selFeatures);
  const navigate = useNavigate();
  const { pathname = "" } = useLocation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [logoTarget, setLogoTarget] = useState<HTMLElement | null>(null);
  const [collapsedIconTarget, setCollapsedIconTarget] =
    useState<HTMLElement | null>(null);

  const sidebarOpen = useSelector(
    (state: AppState) => state.system.sidebarOpen,
  );
  const allowedMenuItems = validRoutes(features);

  const findLogoContainer = useCallback(() => {
    if (!wrapperRef.current) return;
    const el = wrapperRef.current.querySelector(
      ".menuLogoContainer",
    ) as HTMLElement | null;
    if (el && el !== logoTarget) {
      // Hide original MDS logo children
      Array.from(el.children).forEach((child) => {
        (child as HTMLElement).style.display = "none";
      });
      setLogoTarget(el);
    }

    // Also find collapsed icon and replace it
    const collapsedEl = wrapperRef.current.querySelector(
      ".collapsedMenuHeader .collapsedIcon",
    ) as HTMLElement | null;
    if (collapsedEl && collapsedEl !== collapsedIconTarget) {
      // Hide original MinIO icon
      Array.from(collapsedEl.children).forEach((child) => {
        (child as HTMLElement).style.display = "none";
      });
      setCollapsedIconTarget(collapsedEl);
    }
  }, [logoTarget, collapsedIconTarget]);

  useEffect(() => {
    // Try immediately and also after a frame in case Menu hasn't rendered yet
    findLogoContainer();
    const rafId = requestAnimationFrame(findLogoContainer);
    return () => cancelAnimationFrame(rafId);
  }, [sidebarOpen, findLogoContainer]);

  return (
    <div ref={wrapperRef}>
      <Menu
        isOpen={sidebarOpen}
        displayGroupTitles
        options={allowedMenuItems}
        applicationLogo={{
          applicationName: getLogoApplicationVariant(),
          subVariant: getLogoVar(),
        }}
        callPathAction={(path) => {
          navigate(path);
        }}
        signOutAction={() => {
          navigate("/logout");
        }}
        collapseAction={() => {
          dispatch(menuOpen(!sidebarOpen));
        }}
        currentPath={pathname}
        mobileModeAuto={false}
      />
      {sidebarOpen &&
        logoTarget &&
        createPortal(
          <BuckitLogo inverse={true} width={180} layout="horizontal" />,
          logoTarget,
        )}
      {!sidebarOpen &&
        collapsedIconTarget &&
        createPortal(
          <div style={{ pointerEvents: "none" }}>
            <BuckitLogo inverse={true} width={30} layout="icon" />
          </div>,
          collapsedIconTarget,
        )}
    </div>
  );
};

export default MenuWrapper;
