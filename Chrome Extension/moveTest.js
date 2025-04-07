const getEventCoords = (coordinateValue) => {
  const board = document.getElementsByClassName('board')[0];
  let clientX;
  let clientY;
  const boardCoords = board.getBoundingClientRect();
  const squareLength = (1 / 8) * boardCoords.width;
  const widthCoord = parseInt(coordinateValue[0] === '0' ? coordinateValue[1] : coordinateValue[0], 10);
  const lengthCoord = parseInt(coordinateValue[2] === '0' ? coordinateValue[3] : coordinateValue[1], 10);

  if (!board.classList.contains('flipped')) {
    clientX = boardCoords.left + widthCoord * squareLength - (1 / 2) * squareLength;
    clientY = boardCoords.bottom - lengthCoord * squareLength + (1 / 2) * squareLength;
  } else {
    clientX = boardCoords.right - widthCoord * squareLength + (1 / 2) * squareLength;
    clientY = boardCoords.top + lengthCoord * squareLength - (1 / 2) * squareLength;
  }
  return { clientX, clientY };
};


const clickSquare = (eventCoords, coordinateValue) => {
  const board = document.getElementsByClassName('board')[0];
  const { clientX, clientY } = eventCoords;
  const eventOptions = {
    view: window, bubbles: true, cancelable: true, clientX, clientY,
  };

  // The board square class may differ depending on the chess.com page. Two of them are identified here.
  const pieceSquareTwoDigits = document.querySelector(`.square-${coordinateValue}`);
  const pieceSquareFourDigits = document.querySelector(`.square-0${coordinateValue[0]}0${coordinateValue[1]}`);

  // Clicking the originating square.
  if (pieceSquareTwoDigits) {
    pieceSquareTwoDigits.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
    pieceSquareTwoDigits.dispatchEvent(new PointerEvent('pointerup', eventOptions));
  } else if (pieceSquareFourDigits) {
    pieceSquareFourDigits.dispatchEvent(new MouseEvent('mousedown', eventOptions));
    pieceSquareFourDigits.dispatchEvent(new MouseEvent('mouseup', eventOptions));

  // Clicking the destination square.
  } else if (board.classList.contains('v-board')) {
    board.dispatchEvent(new MouseEvent('mousedown', eventOptions));
    board.dispatchEvent(new MouseEvent('mouseup', eventOptions));
  } else {
    board.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
    board.dispatchEvent(new PointerEvent('pointerup', eventOptions));
  }
};


const findSquareAndClick = (coordinateValue) => {
  const numeralCoordinateValue = parseInt(coordinateValue, 10);
  // Only accepts integers between 11-88 (inclusive), and excluding numbers containing a zero or nine.
  if (numeralCoordinateValue >= 11 && numeralCoordinateValue <= 88 && !coordinateValue.includes('9') && !coordinateValue.includes('0')) {
    const eventCoords = getEventCoords(coordinateValue);
    clickSquare(eventCoords, coordinateValue);
  }
};