import type {
  RuntimeCameraTuning,
  RuntimeCarTuning,
  RuntimeIsometricCameraTuning,
  RuntimeStaticArenaCameraTuning,
  RuntimeThirdPersonCameraTuning,
  RuntimeTopDownCameraTuning,
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
    hint.textContent = 'Camera: 1 Third | 2 Top | 3 Iso | 4 Static | C Next';

    this.root.append(
      hint,
      createCarSection(this.tuning.car),
      createThirdPersonCameraSection(this.tuning.camera.thirdPerson),
      createTopDownCameraSection(this.tuning.camera.topDown),
      createIsometricCameraSection(this.tuning.camera.isometric),
      createStaticArenaCameraSection(this.tuning.camera.staticArena),
    );
  }
}

function createCarSection(tuning: RuntimeCarTuning): HTMLElement {
  return createSection('Car Controller', [
    {
      label: 'Acceleration',
      min: 1,
      max: 40,
      step: 0.5,
      getValue: () => tuning.acceleration,
      setValue: (value) => {
        tuning.acceleration = value;
      },
    },
    {
      label: 'Reverse Accel',
      min: 1,
      max: 30,
      step: 0.5,
      getValue: () => tuning.reverseAcceleration,
      setValue: (value) => {
        tuning.reverseAcceleration = value;
      },
    },
    {
      label: 'Brake Decel',
      min: 1,
      max: 50,
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
      max: 30,
      step: 0.5,
      getValue: () => tuning.maxForwardSpeed,
      setValue: (value) => {
        tuning.maxForwardSpeed = value;
      },
    },
    {
      label: 'Reverse Speed',
      min: 1,
      max: 15,
      step: 0.5,
      getValue: () => tuning.maxReverseSpeed,
      setValue: (value) => {
        tuning.maxReverseSpeed = value;
      },
    },
    {
      label: 'Turn Speed',
      min: 0.5,
      max: 12,
      step: 0.1,
      getValue: () => tuning.turnSpeed,
      setValue: (value) => {
        tuning.turnSpeed = value;
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

function createTopDownCameraSection(
  tuning: RuntimeTopDownCameraTuning,
): HTMLElement {
  return createSection('Top Down Camera', [
    {
      label: 'Height',
      min: 5,
      max: 60,
      step: 0.5,
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
  ]);
}

function createIsometricCameraSection(
  tuning: RuntimeIsometricCameraTuning,
): HTMLElement {
  return createSection('Isometric Camera', [
    {
      label: 'Distance',
      min: 4,
      max: 40,
      step: 0.5,
      getValue: () => tuning.distance,
      setValue: (value) => {
        tuning.distance = value;
      },
    },
    {
      label: 'Height',
      min: 3,
      max: 30,
      step: 0.5,
      getValue: () => tuning.height,
      setValue: (value) => {
        tuning.height = value;
      },
    },
    {
      label: 'Angle',
      min: 0,
      max: 360,
      step: 1,
      getValue: () => tuning.angleDegrees,
      setValue: (value) => {
        tuning.angleDegrees = value;
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

function createStaticArenaCameraSection(
  tuning: RuntimeStaticArenaCameraTuning,
): HTMLElement {
  return createSection('Static Arena Camera', [
    {
      label: 'Pos X',
      min: -60,
      max: 60,
      step: 0.5,
      getValue: () => tuning.positionX,
      setValue: (value) => {
        tuning.positionX = value;
      },
    },
    {
      label: 'Pos Y',
      min: 2,
      max: 80,
      step: 0.5,
      getValue: () => tuning.positionY,
      setValue: (value) => {
        tuning.positionY = value;
      },
    },
    {
      label: 'Pos Z',
      min: -60,
      max: 60,
      step: 0.5,
      getValue: () => tuning.positionZ,
      setValue: (value) => {
        tuning.positionZ = value;
      },
    },
    {
      label: 'Look X',
      min: -30,
      max: 30,
      step: 0.5,
      getValue: () => tuning.lookAtX,
      setValue: (value) => {
        tuning.lookAtX = value;
      },
    },
    {
      label: 'Look Y',
      min: -10,
      max: 20,
      step: 0.5,
      getValue: () => tuning.lookAtY,
      setValue: (value) => {
        tuning.lookAtY = value;
      },
    },
    {
      label: 'Look Z',
      min: -30,
      max: 30,
      step: 0.5,
      getValue: () => tuning.lookAtZ,
      setValue: (value) => {
        tuning.lookAtZ = value;
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