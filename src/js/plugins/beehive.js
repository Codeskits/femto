import { sync } from '../utils';

export default class Beehive {
  constructor (flow, settings) {
    this.flow = flow;
    this.settings = {
      ...Beehive.defaults,
      ...settings
    }
  }

  init () {
    this.beehive = document.createElement('div');
    const fragment = document.createDocumentFragment();
    const radius = this.settings.radius;
    const xShift = radius + radius / 2;
    const yShift = radius / 2;
    const cellPerWidth = Math.round(this.flow.sliderWidth / (radius * 1.5) + 1);
    const cellPerHeight = (this.flow.sliderHeight / radius);
    const cellsCount = (cellPerWidth * cellPerHeight * 2) + (cellPerWidth);

    this.beehive.classList.add('beehive');
    this.beehive.insertAdjacentHTML('afterbegin',
      '<div class="beehive-cell"></div>'.repeat(cellsCount)
    );
    this.cells = Array.from(this.beehive.querySelectorAll('.beehive-cell'));
    this.cells.forEach((cell, i) => {
      const x = i % cellPerWidth + (0.5 * (Math.floor(i / cellPerWidth) % 2));
      const y = Math.floor(i / cellPerWidth);
      const deltaX = x * xShift;
      const deltaY = y * yShift;
      cell.style.transitionDelay = `${i * 0.02}s`;
      cell.style.clipPath = `polygon(
        ${deltaX}px                    ${deltaY + (radius * -0.50)}px,
        ${deltaX + (radius * 0.50)}px  ${deltaY + (radius * -0.50)}px,
        ${deltaX + (radius * 0.75)}px  ${deltaY}px,
        ${deltaX + (radius * 0.50)}px  ${deltaY + (radius * 0.50)}px,
        ${deltaX}px                    ${deltaY + (radius * 0.50)}px,
        ${deltaX + (radius * -0.25)}px ${deltaY}px
      )`;
    });
    fragment.appendChild(this.beehive);
    this.flow.el.appendChild(fragment);
    this.updateBackground();
  }

  updateSlide (slideNumber) {
    this.flow.activeSlide.classList.remove('is-active');
    this.flow.slides[slideNumber].classList.add('is-active');
    this.beehive.classList.add('is-active');
    const lastCell = this.cells[this.cells.length - 1];
    
    sync(() => {
      this.cells.forEach(cell => {
        cell.classList.add('is-hidden');
      });
      const transitionEndCallback = () => {
        this.flow.activeSlide = this.flow.slides[slideNumber];
        this.flow.updating = false;
        this.beehive.classList.remove('is-active');
        this.updateBackground();
        lastCell.removeEventListener('transitionend', transitionEndCallback);
      };
      lastCell.addEventListener('transitionend', transitionEndCallback);
    });
    lastCell.dispatchEvent(new Event('transitionend'));
  }

  updateBackground () {
    const currentImage = this.flow.imagesSrc[this.flow.activeIndex];
    this.cells.forEach(cell => {
      cell.style.backgroundImage = `url(${currentImage})`;
      cell.classList.remove('is-hidden');
    });
  }

  // eslint-disable-next-line
  static defaults = {
    radius: 200
  }
}