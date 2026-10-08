import type {
  RuntimeCarTuning,
  RuntimeThirdPersonCameraTuning,
  RuntimeTuning,
} from '../debug/RuntimeTuning';

interface NumberSliderOptions {
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly getValue: () => number;
  readonly setValue: (value: number) => void;
}

export class RuntimeTuningPanel {
  private readonly root: HTMLDivElement;
  private readonly tuning: RuntimeTuning;
  private isCollapsed = false;

  public constructor(parent: HTMLElement, tuning: RuntimeTuning) {
    this.tuning = tuning;

    this.root = document.createElement('div');
    this.root.className = 'runtime-tuning-panel';

    parent.appendChild(this.root);
    this.render();
  }

  public dispose(): void {
    this.root.remove();
  }

  private render(): void {
    this.root.innerHTML = '';

    const header = document.createElement('header');
    header.className = 'runtime-tuning-panel__header';

    const title = document.createElement('strong');
    title.textContent = 'Runtime Tuning';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = this.isCollapsed ? 'Show' : 'Hide';
    toggleButton.addEventListener('click', () => {
      this.isCollapsed = !this.isCollapsed;
      this.render();
    });

    header.append(title, toggleButton);
    this.root.append(header);

    if (this.isCollapsed) {
      return;
    }

    const hint = document.createElement('p');
    hint.className = 'runtime-tuning-panel__hint';

    this.root.append(
      hint,
      createCarSection(this.tuning.car),
      createThirdPersonCameraSection(this.tuning.camera.thirdPerson),
    );
  }
}

function createCarSection(tuning: RuntimeCarTuning): HTMLElement {
  return createSection('Car Controller', [
    {
      label: 'Mass',
      min: 0.25,
      max: 5,
      step: 0.05,
      getValue: () => tuning.mass,
      setValue: (value) => {
        tuning.mass = value;
      },
    },
    {
      label: 'Acceleration',
      min: 1,
      max: 60,
      step: 0.5,
      getValue: () => tuning.acceleration,
      setValue: (value) => {
        tuning.acceleration = value;
      },
    },
    {
      label: 'Reverse Accel',
      min: 1,
      max: 40,
      step: 0.5,
      getValue: () => tuning.reverseAcceleration,
      setValue: (value) => {
        tuning.reverseAcceleration = value;
      },
    },
    {
      label: 'Brake Decel',
      min: 1,
      max: 70,
      step: 0.5,
      getValue: () => tuning.brakeDeceleration,
      setValue: (value) => {
        tuning.brakeDeceleration = value;
      },
    },
    {
      label: 'Drag',
      min: 0,
      max: 20,
      step: 0.25,
      getValue: () => tuning.drag,
      setValue: (value) => {
        tuning.drag = value;
      },
    },
    {
      label: 'Max Speed',
      min: 1,
      max: 40,
      step: 0.5,
      getValue: () => tuning.maxForwardSpeed,
      setValue: (value) => {
        tuning.maxForwardSpeed = value;
      },
    },
    {
      label: 'Reverse Speed',
      min: 1,
      max: 20,
      step: 0.5,
      getValue: () => tuning.maxReverseSpeed,
      setValue: (value) => {
        tuning.maxReverseSpeed = value;
      },
    },
    {
      label: 'Turn Speed',
      min: 0.5,
      max: 20,
      step: 0.1,
      getValue: () => tuning.turnSpeed,
      setValue: (value) => {
        tuning.turnSpeed = value;
      },
    },
    {
      label: 'Steer Response',
      min: 1,
      max: 50,
      step: 0.5,
      getValue: () => tuning.steeringResponse,
      setValue: (value) => {
        tuning.steeringResponse = value;
      },
    },
    {
      label: 'Angular Drag',
      min: 0,
      max: 50,
      step: 0.5,
      getValue: () => tuning.angularDrag,
      setValue: (value) => {
        tuning.angularDrag = value;
      },
    },
    {
      label: 'Low Speed Turn',
      min: 0,
      max: 1,
      step: 0.01,
      getValue: () => tuning.lowSpeedTurnFactor,
      setValue: (value) => {
        tuning.lowSpeedTurnFactor = value;
      },
    },
    {
      label: 'Lateral Grip',
      min: 0,
      max: 25,
      step: 0.25,
      getValue: () => tuning.lateralGrip,
      setValue: (value) => {
        tuning.lateralGrip = value;
      },
    },
    {
      label: 'Drift Grip',
      min: 0,
      max: 15,
      step: 0.25,
      getValue: () => tuning.driftGrip,
      setValue: (value) => {
        tuning.driftGrip = value;
      },
    },
    {
      label: 'Drift Turn',
      min: 0.5,
      max: 4,
      step: 0.05,
      getValue: () => tuning.driftTurnMultiplier,
      setValue: (value) => {
        tuning.driftTurnMultiplier = value;
      },
    },
    {
      label: 'Drift Retain',
      min: 0.5,
      max: 1,
      step: 0.01,
      getValue: () => tuning.driftSpeedRetention,
      setValue: (value) => {
        tuning.driftSpeedRetention = value;
      },
    },
    {
      label: 'Boost Mult',
      min: 1,
      max: 5,
      step: 0.05,
      getValue: () => tuning.boostMultiplier,
      setValue: (value) => {
        tuning.boostMultiplier = value;
      },
    },
    {
      label: 'Boost Turn Pen',
      min: 0.2,
      max: 1.5,
      step: 0.05,
      getValue: () => tuning.boostTurnPenalty,
      setValue: (value) => {
        tuning.boostTurnPenalty = value;
      },
    },
    {
      label: 'Boost Min Speed',
      min: 0,
      max: 20,
      step: 0.5,
      getValue: () => tuning.boostMinSpeed,
      setValue: (value) => {
        tuning.boostMinSpeed = value;
      },
    },
    {
      label: 'Visual Lean',
      min: 0,
      max: 0.5,
      step: 0.01,
      getValue: () => tuning.visualLeanAmount,
      setValue: (value) => {
        tuning.visualLeanAmount = value;
      },
    },
    {
      label: 'Drift Lean',
      min: 0,
      max: 0.8,
      step: 0.01,
      getValue: () => tuning.visualDriftLeanAmount,
      setValue: (value) => {
        tuning.visualDriftLeanAmount = value;
      },
    },
  ]);
}

function createThirdPersonCameraSection(
  tuning: RuntimeThirdPersonCameraTuning,
): HTMLElement {
  return createSection('Third Person Camera', [
    {
      label: 'Distance',
      min: 2,
      max: 20,
      step: 0.25,
      getValue: () => tuning.distance,
      setValue: (value) => {
        tuning.distance = value;
      },
    },
    {
      label: 'Height',
      min: 1,
      max: 15,
      step: 0.25,
      getValue: () => tuning.height,
      setValue: (value) => {
        tuning.height = value;
      },
    },
    {
      label: 'Look Height',
      min: 0,
      max: 5,
      step: 0.1,
      getValue: () => tuning.lookAtHeight,
      setValue: (value) => {
        tuning.lookAtHeight = value;
      },
    },
    {
      label: 'Pos Smooth',
      min: 1,
      max: 40,
      step: 0.5,
      getValue: () => tuning.positionSmoothing,
      setValue: (value) => {
        tuning.positionSmoothing = value;
      },
    },
    {
      label: 'Look Smooth',
      min: 1,
      max: 40,
      step: 0.5,
      getValue: () => tuning.lookAtSmoothing,
      setValue: (value) => {
        tuning.lookAtSmoothing = value;
      },
    },
  ]);
}

function createSection(
  title: string,
  sliders: readonly NumberSliderOptions[],
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'runtime-tuning-panel__section';

  const heading = document.createElement('h2');
  heading.textContent = title;

  section.append(heading);

  for (const slider of sliders) {
    section.append(createNumberSlider(slider));
  }

  return section;
}

function createNumberSlider(options: NumberSliderOptions): HTMLElement {
  const row = document.createElement('label');
  row.className = 'runtime-tuning-panel__row';

  const name = document.createElement('span');
  name.textContent = options.label;

  const value = document.createElement('output');
  value.textContent = options.getValue().toFixed(2);

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.getValue());

  input.addEventListener('input', () => {
    const nextValue = Number(input.value);

    options.setValue(nextValue);
    value.textContent = nextValue.toFixed(2);
  });

  row.append(name, input, value);

  return row;
}