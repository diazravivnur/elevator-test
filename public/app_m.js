const canvas = document.getElementById('elevatorCanvas');
const ctx = canvas.getContext('2d');

const totalFloors = 50;
const floorHeight = 14; 
const elevatorWidth = 10;
const elevatorHeight = 13;

let elevators = [
  { currentFloor: 0, previousFloor: 0, targetFloor: 0, animationId: null },
  { currentFloor: 0, previousFloor: 0, targetFloor: 0, animationId: null },
  { currentFloor: 0, previousFloor: 0, targetFloor: 0, animationId: null }
];

let deliveredCount = 0;
let startTime = new Date();
let finishTime;

let waitingPeople = new Set(mans.map(person => person.from));

function drawFloors() {
  ctx.fillStyle = 'black';
  for (let i = 0; i < totalFloors; i++) {
    const yPosition = canvas.height - (i + 1) * floorHeight;
    ctx.fillText(`Floor ${i+1}`, 10, yPosition + floorHeight - 2);
    
    ctx.beginPath();
    ctx.moveTo(0, yPosition);
    ctx.lineTo(canvas.width, yPosition);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(110, yPosition);
    ctx.lineTo(110, yPosition + canvas.height);
    ctx.stroke();
  }
}

function drawElevatorBox(xPos, yPos, wVal, hVal) {
  ctx.fillStyle = 'red';
  ctx.fillRect(xPos, yPos, wVal, hVal);
}

function drawElevator() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFloors();

  elevators.forEach((elevator, idx) => {
    const pos = 55 + (idx * 15);
    const elevatorYPos = canvas.height - (elevator.currentFloor + 1) * floorHeight + (floorHeight - elevatorHeight);
    drawElevatorBox(pos, elevatorYPos, elevatorWidth, elevatorHeight);

    for (let floor = 0; floor < totalFloors; floor++) {
      if (waitingPeople.has(floor + 1)) {
        ctx.fillText('Waiting', 115, floor * floorHeight);
      }
    }
  });
}

function animateElevator(idx, cb) {
  const elevator = elevators[idx];
  const moveStep = 0.2;

  if (elevator.currentFloor < elevator.targetFloor) {
    elevator.currentFloor += moveStep;
    if (elevator.currentFloor > elevator.targetFloor) elevator.currentFloor = elevator.targetFloor;
  } else if (elevator.currentFloor > elevator.targetFloor) {
    elevator.currentFloor -= moveStep;
    if (elevator.currentFloor < elevator.targetFloor) elevator.currentFloor = elevator.targetFloor;
  }

  drawElevator();

  if (elevator.currentFloor !== elevator.targetFloor) {
    elevator.animationId = requestAnimationFrame(() => animateElevator(idx, cb));
  } else {
    elevator.previousFloor = elevator.currentFloor;
    cancelAnimationFrame(elevator.animationId);
    if (typeof cb === 'function') cb(elevator);
  }
}

function moveElevator(idx, man, cb) {
  const elevator = elevators[idx];
  
  elevator.targetFloor = man.from - 1;

  animateElevator(idx, () => {
    waitingPeople.delete(man.from);

    setTimeout(() => {
      elevator.targetFloor = man.to - 1;
      animateElevator(idx, () => {
        if (man.to - 1 === elevator.currentFloor) {
          updateDeliverCount(1);
        }

        elevator.targetFloor = 0;
        animateElevator(idx, () => {
          if (typeof cb === 'function') {
            setTimeout(cb, 2000);
          }
        });
      });
    }, 2000); 
  });
}

function updateDeliverCount(v) {
  if (v !== undefined && v > 0) {
    deliveredCount += v;
  }
  document.getElementById("startTime").innerHTML = startTime.toLocaleString();
  if (finishTime) {
    document.getElementById("finishTime").innerHTML = finishTime.toLocaleString();
    document.getElementById("gapTime").innerHTML = getDateTimeSince(startTime);
  }

  document.getElementById("counter").innerHTML = deliveredCount;
}

function runElevatorSimulation(elevatorIdx, row) {
  if (row === mans.length) return;
  const person = mans[row];

  moveElevator(elevatorIdx, person, () => {
    const nextPerson = mans[row + 1];
    if (nextPerson) {
      runElevatorSimulation(getNextElevator(elevatorIdx), row + 1);
    } else {
      finishTime = new Date();
      updateDeliverCount();
    }
  });
}

function getNextElevator(idx) {
  return (idx + 1) % elevators.length;
}

runElevatorSimulation(0, 0);
