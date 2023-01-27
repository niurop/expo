type SimpleScreen = {
  id: string;
  self: Element;
  DOMElements: { [id: string]: Element };
};

function createElement(
  tagName: string,
  id?: string,
  classes?: string[],
  properties?: { [id: string]: any },
  options?: ElementCreationOptions
): HTMLElement {
  const elem = document.createElement(tagName, options);
  if (id !== undefined) elem.id = id;
  classes !== undefined && elem.classList.add(...classes);
  for (let key in properties) elem[key] = properties[key];
  return elem;
}

class SimpleScreens {
  screens: { [id: string]: SimpleScreen } = {};
  currentScreen: SimpleScreen;
  screenTransitions: {
    [id: string]: (screen: SimpleScreen, args?: any) => boolean;
  } = {};

  constructor(
    prefix: string = "sec_",
    inits: { [sec_id: string]: (screen: SimpleScreen) => boolean } = {},
    screenTransitions: {
      [id: string]: (screen: SimpleScreen, args?: any) => boolean;
    }
  ) {
    if (screenTransitions) this.screenTransitions = screenTransitions;

    document.querySelectorAll(`[id^=${prefix}]`).forEach((screenElem) => {
      const id = screenElem.id;

      let DOMElements = {};

      screenElem
        .querySelectorAll("[id]")
        .forEach((childElem) => (DOMElements[childElem.id] = childElem));

      const screen: SimpleScreen = {
        id,
        self: screenElem,
        DOMElements,
      };

      if (id in inits && inits[id](screen) === false)
        throw `Unable to init screen ${id}`;

      this.screens[id] = screen;
      screenElem.classList.add("ss-hidden");
    });
  }

  add(
    parent: Element,
    obj: Element,
    init?: (screen: SimpleScreen, args?: any) => boolean,
    screenTransition?: (screen: SimpleScreen, args?: any) => boolean,
    args?: any
  ): boolean {
    if (!(parent instanceof Element)) throw `parent: ${obj} is not an Element`;
    if (!(obj instanceof Element)) throw `obj: ${obj} is not an Element`;
    let DOMElements = {};

    obj
      .querySelectorAll("[id]")
      .forEach((childElem) => (DOMElements[childElem.id] = childElem));

    let screen: SimpleScreen = { id: obj.id, self: obj, DOMElements };

    if (init && !init(screen, args)) return false;

    if (screenTransition) this.screenTransitions[obj.id] = screenTransition;

    if (obj.parentNode !== parent) parent.appendChild(obj);

    return true;
  }

  remove;

  change(id: string, args?: any): boolean {
    if (!(id in this.screens)) throw `Unknown screen ${id}`;
    if (this.currentScreen) this.currentScreen.self.classList.add("ss-hidden");
    this.currentScreen = this.screens[id];
    this.currentScreen.self.classList.remove("ss-hidden");
    if (id in this.screenTransitions)
      return this.screenTransitions[id](this.currentScreen, args);
    return true;
  }
}
