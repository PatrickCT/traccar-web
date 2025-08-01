/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-plusplus */
/* eslint-disable react/default-props-match-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/no-array-index-key */
import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

// Wrapper
const WrapperContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #ccc;
`;

export const Wrapper = ({ children }) => <WrapperContainer>{children}</WrapperContainer>;

// Marquee
const moveLeft = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

const MarqueeContainer = styled.div`
  position: absolute;
  width: 100%;
  margin-top: 20px;
  padding: 10px 0;
  background-color: white;
  overflow: hidden;
  z-index: 20;
  &:hover {
    animation-play-state: paused;
  }
  &::after {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;

  }
`;

const MarqueeArea = styled.div`
  display: inline-block;
  white-space: nowrap;
  transform: translateX(-${(props) => props.move}px);
  animation: ${moveLeft} ${(props) => props.time}s linear infinite
    ${(props) => (props.toRight ? 'reverse' : '')};
  animation-play-state: inherit;
`;

const MarqueeItem = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 80vw;
`;

const getFillList = (list, copyTimes = 1) => {
  const newList = [''];
  for (let i = 0; i < copyTimes; i++) {
    newList.push(...list);
  }
  return newList;
};

const Marquee = ({ list, time, toRight, ...props }) => {
  const marqueeContainer = useRef(null);
  const marqueeArea = useRef(null);
  const [moveLeft, setMoveLeft] = useState(0);
  const [showList, setShowList] = useState(list);
  const [realTime, setRealTime] = useState(time);
  const [itemCounts, setItemCounts] = useState({});

  useEffect(() => {
    const containerWidth = Math.floor(marqueeContainer.current.offsetWidth);
    const areaWidth = Math.floor(marqueeArea.current.scrollWidth);
    // Copy times must be at least 2 (more than twice the width of the marquee)
    const copyTimes = Math.max(2, Math.ceil((containerWidth * 2) / areaWidth));
    // Distance moved in one cycle
    const newMoveLeft = areaWidth * Math.floor(copyTimes / 2);
    // Actual time for one cycle
    const newRealTime = time * parseFloat((newMoveLeft / containerWidth).toFixed(2));
    setShowList(getFillList(list, copyTimes));
    setMoveLeft(newMoveLeft);
    setRealTime(newRealTime);
  }, [list, time]);

  const handleVisibilityChange = useCallback(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const { itemId } = entry.target.dataset;
          setItemCounts((prevCounts) => ({
            ...Object.fromEntries(new Map(Object.entries(prevCounts).filter(([k, v]) => v <= 10))),
            [itemId.toString()]: (prevCounts[itemId] || 0) + 1,
          }));
        }
      });
    },
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleVisibilityChange, {
      root: marqueeContainer.current,
      threshold: 1.0,
    });

    const items = marqueeArea.current.querySelectorAll('[data-item-id]');
    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, [showList, handleVisibilityChange]);

  return (
    <MarqueeContainer ref={marqueeContainer} {...props}>
      <MarqueeArea ref={marqueeArea} move={moveLeft} time={realTime} toRight={toRight}>
        {showList.map((item, index) => (
          <MarqueeItem
            data-item-id={index}
            key={index}
          >
            {item}
          </MarqueeItem>
        ))}
      </MarqueeArea>
    </MarqueeContainer>
  );
};

Marquee.propTypes = {
  list: PropTypes.array.isRequired,
  time: PropTypes.number.isRequired,
  toRight: PropTypes.bool,
};

Marquee.defaultProps = {
  list: [],
  time: 10,
  toRight: false,
};

export default Marquee;
