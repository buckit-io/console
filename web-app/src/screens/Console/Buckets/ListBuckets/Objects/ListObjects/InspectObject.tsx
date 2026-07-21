// This file is part of MinIO Console Server
// Copyright (c) 2022 MinIO, Inc.
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

import React, { useState } from "react";
import {
  Button,
  InspectMenuIcon,
  PasswordKeyIcon,
  Switch,
  Grid,
  Box,
} from "mds";
import {
  deleteCookie,
  getCookieValue,
  performDownload,
} from "../../../../../../common/utils";
import ModalWrapper from "../../../../Common/ModalWrapper/ModalWrapper";
import { modalStyleUtils } from "../../../../Common/FormComponents/common/styleLibrary";
import KeyRevealer from "../../../../Tools/KeyRevealer";
import { setErrorSnackMessage } from "../../../../../../systemSlice";
import { useAppDispatch } from "../../../../../../store";
import { api } from "../../../../../../api";

interface IInspectObjectProps {
  closeInspectModalAndRefresh: (refresh: boolean) => void;
  inspectOpen: boolean;
  inspectPath: string;
  volumeName: string;
}

const InspectObject = ({
  closeInspectModalAndRefresh,
  inspectOpen,
  inspectPath,
  volumeName,
}: IInspectObjectProps) => {
  const dispatch = useAppDispatch();
  const onClose = () => closeInspectModalAndRefresh(false);
  const [isEncrypt, setIsEncrypt] = useState<boolean>(true);
  const [decryptionKey, setDecryptionKey] = useState<string>("");
  const [insFileName, setInsFileName] = useState<string>("");

  if (!inspectPath) {
    return null;
  }
  const performInspect = async () => {
    const query = new URLSearchParams({
      volume: volumeName,
      file: `${inspectPath}/xl.meta`,
      encrypt: String(isEncrypt),
    });

    fetch(`${api.baseUrl}/admin/inspect?${query}`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          const resErr: any = await res.json().catch(() => ({}));

          dispatch(
            setErrorSnackMessage({
              errorMessage: resErr.message || "Unable to inspect object",
              detailedError: resErr.code || res.statusText,
            }),
          );
          return;
        }

        const filename = res.headers
          .get("content-disposition")
          ?.match(/filename="([^"]+)"/)?.[1];
        if (!filename) {
          dispatch(
            setErrorSnackMessage({
              errorMessage: "The inspection response did not include a file.",
              detailedError: "missing content-disposition header",
            }),
          );
          return;
        }

        const blob: Blob = await res.blob();
        const decryptKey = getCookieValue(filename) || "";

        performDownload(blob, filename);
        setInsFileName(filename);
        if (decryptKey === "") {
          onClose();
          return;
        }
        setDecryptionKey(decryptKey);
      })
      .catch((err) => {
        dispatch(setErrorSnackMessage(err));
      });
  };

  const onCloseDecKeyModal = () => {
    deleteCookie(insFileName);
    onClose();
    setDecryptionKey("");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <React.Fragment>
      {!decryptionKey && (
        <ModalWrapper
          modalOpen={inspectOpen}
          titleIcon={<InspectMenuIcon />}
          title={`Inspect Object`}
          onClose={onClose}
        >
          <form
            noValidate
            autoComplete="off"
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              onSubmit(e);
            }}
          >
            Would you like to encrypt <b>{inspectPath}</b>? <br />
            <Switch
              label={"Encrypt"}
              indicatorLabels={["Yes", "No"]}
              checked={isEncrypt}
              value={"encrypt"}
              id="encrypt"
              name="encrypt"
              onChange={(e) => {
                setIsEncrypt(!isEncrypt);
              }}
              description=""
            />
            <Grid item xs={12} sx={modalStyleUtils.modalButtonBar}>
              <Button
                id={"inspect"}
                type="submit"
                variant="callAction"
                color="primary"
                onClick={performInspect}
                label={"Inspect"}
              />
            </Grid>
          </form>
        </ModalWrapper>
      )}
      {decryptionKey ? (
        <ModalWrapper
          modalOpen={inspectOpen}
          title="Inspect Decryption Key"
          onClose={onCloseDecKeyModal}
          titleIcon={<PasswordKeyIcon />}
        >
          <Box>
            This will be displayed only once. It cannot be recovered.
            <br />
            Use secure medium to share this key.
          </Box>
          <Box>
            <KeyRevealer value={decryptionKey} />
          </Box>
        </ModalWrapper>
      ) : null}
    </React.Fragment>
  );
};

export default InspectObject;
