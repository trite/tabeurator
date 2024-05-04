import React, { useState } from "react";
import {
  Collapse,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  InfoOutlined,
  WarningOutlined,
  ErrorOutline,
} from "@mui/icons-material";

// BEGIN exported types
interface InfoMessage {
  type: "Info";
  message: string;
}

interface WarningMessage {
  type: "Warning";
  message: string;
  resolution: string;
}

interface ErrorMessage {
  type: "Error";
  message: string;
  resolution: string;
}

export const infoMessage = ({ message }: { message: string }): InfoMessage => ({
  type: "Info",
  message,
});

export const warningMessage = ({
  message,
  resolution,
}: {
  message: string;
  resolution: string;
}): WarningMessage => ({
  type: "Warning",
  message,
  resolution,
});

export const errorMessage = ({
  message,
  resolution,
}: {
  message: string;
  resolution: string;
}): ErrorMessage => ({
  type: "Error",
  message,
  resolution,
});

type Message = InfoMessage | WarningMessage | ErrorMessage;
// END exported types

interface MessagePanelProps {
  messages: Message[];
}

const StyledListItem = styled(ListItem)({
  paddingTop: 4,
  paddingBottom: 4,
});

const SmallTextTypography = styled(Typography)({
  fontSize: "0.8rem",
});

const MessagePanel: React.FC<MessagePanelProps> = ({ messages }) => {
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});

  const handleClick = (index: number) => {
    setOpen({ ...open, [index]: !open[index] });
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <Box border={1} borderColor="divider" borderRadius={1} m={2}>
      <List>
        {messages.map((message, index) => (
          <div key={index}>
            <StyledListItem>
              <Box
                color={
                  message.type === "Info"
                    ? "info.main"
                    : message.type === "Warning"
                    ? "warning.main"
                    : "error.main"
                }
                display="flex"
                alignItems="center"
                sx={{ gap: 1 }} // Add some space between the icon and the text
              >
                {message.type === "Info" && <InfoOutlined />}
                {message.type === "Warning" && <WarningOutlined />}
                {message.type === "Error" && <ErrorOutline />}
                <ListItemText
                  primary={
                    <SmallTextTypography>{message.message}</SmallTextTypography>
                  }
                />
              </Box>
              {message.type !== "Info" && (
                <Button onClick={() => handleClick(index)} size="small">
                  {open[index] ? "Hide Resolution" : "Show Resolution"}
                </Button>
              )}
            </StyledListItem>
            {message.type !== "Info" && (
              <Collapse in={open[index]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <StyledListItem sx={{ paddingLeft: 4 }}>
                    {" "}
                    {/* Indent the resolution text */}
                    <ListItemText
                      primary={
                        <SmallTextTypography>
                          {message.resolution}
                        </SmallTextTypography>
                      }
                    />
                  </StyledListItem>
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>
    </Box>
  );
};

export type { InfoMessage, WarningMessage, ErrorMessage, Message };
export default MessagePanel;
