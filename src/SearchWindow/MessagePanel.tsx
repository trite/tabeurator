import React, { useState } from "react";
import {
  Collapse,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
} from "@mui/material";
import { styled } from "@mui/system";

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
    <List>
      {messages.map((message, index) => (
        <div key={index}>
          <StyledListItem>
            <ListItemText
              primary={
                <SmallTextTypography>{message.message}</SmallTextTypography>
              }
            />
            {message.type !== "Info" && (
              <Button onClick={() => handleClick(index)} size="small">
                {open[index] ? "hide fix" : "show fix"}
              </Button>
            )}
          </StyledListItem>
          {message.type !== "Info" && (
            <Collapse in={open[index]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledListItem>
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
  );
};

export type { InfoMessage, WarningMessage, ErrorMessage, Message };
export default MessagePanel;
