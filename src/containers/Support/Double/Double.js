import React from "react";
import ClearButton from "../../../components/ClearButton/ClearButton";
import ConfirmButton from "../../../components/ConfirmButton/ConfirmButton";
import MainTextarea from "../../../components/MainTextarea/MainTextarea";
import InputSection from "./Sections/InputSection";
import SexSection from "./Sections/SexSection";
import { ConfirmButtonsWrapper, StyledSexSection } from "./StyledDouble";

const Double = (props) => {
  return (
    <>
      <div>
        <StyledSexSection>
          <SexSection />
        </StyledSexSection>
        <InputSection type={props.type} />
        <ConfirmButtonsWrapper>
          <ConfirmButton />
          <ClearButton />
        </ConfirmButtonsWrapper>
      </div>
      <MainTextarea />
    </>
  );
};
export default Double;
