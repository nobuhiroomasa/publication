const TinyReact = (() => {
  let hooks = [];
  let hookCursor = 0;
  let effectCursor = 0;
  let effectStore = [];
  let pendingEffects = [];
  let rootRender = null;
  let rootVNode = null;
  let rootContainer = null;

  const Fragment = Symbol('fragment');

  function createElement(type, props, ...children) {
    return {
      type,
      props: props || {},
      children: children.flat().filter((child) => child !== undefined && child !== null),
    };
  }

  function setProperty(node, key, value) {
    if (key === 'className') {
      node.setAttribute('class', value);
      return;
    }
    if (key === 'style') {
      if (typeof value === 'string') {
        node.setAttribute('style', value);
      } else if (value && typeof value === 'object') {
        Object.assign(node.style, value);
      }
      return;
    }
    if (key === 'dangerouslySetInnerHTML' && value && typeof value.__html === 'string') {
      node.innerHTML = value.__html;
      return;
    }
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase();
      node.addEventListener(eventName, value);
      return;
    }
    if (value === false || value === null || value === undefined) {
      return;
    }
    if (value === true) {
      node.setAttribute(key, '');
      return;
    }
    node.setAttribute(key, value);
  }

  function createDom(vnode) {
    if (vnode === null || vnode === undefined || vnode === false) {
      return document.createComment('');
    }
    if (Array.isArray(vnode)) {
      const fragment = document.createDocumentFragment();
      vnode.forEach((child) => {
        const childNode = createDom(child);
        if (childNode) {
          fragment.appendChild(childNode);
        }
      });
      return fragment;
    }
    if (typeof vnode === 'string' || typeof vnode === 'number') {
      return document.createTextNode(vnode);
    }
    if (typeof vnode.type === 'function') {
      const props = Object.assign({}, vnode.props, { children: vnode.children });
      const rendered = vnode.type(props);
      return createDom(rendered);
    }
    if (vnode.type === Fragment) {
      const fragment = document.createDocumentFragment();
      vnode.children.forEach((child) => {
        const childNode = createDom(child);
        if (childNode) {
          fragment.appendChild(childNode);
        }
      });
      return fragment;
    }
    const node = document.createElement(vnode.type);
    const props = vnode.props || {};
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'children') {
        return;
      }
      setProperty(node, key, value);
    });
    vnode.children.forEach((child) => {
      const childNode = createDom(child);
      if (childNode) {
        node.appendChild(childNode);
      }
    });
    return node;
  }

  function flushEffects() {
    pendingEffects.forEach(({ index, effect, deps }) => {
      const previous = effectStore[index];
      if (previous && typeof previous.cleanup === 'function') {
        previous.cleanup();
      }
      const cleanup = effect() || null;
      effectStore[index] = { deps, cleanup };
    });
    pendingEffects = [];
  }

  function renderVNode(vnode, container) {
    hookCursor = 0;
    effectCursor = 0;
    pendingEffects = [];
    const dom = createDom(vnode);
    container.innerHTML = '';
    if (dom) {
      container.appendChild(dom);
    }
    flushEffects();
  }

  function rerender() {
    if (rootRender && rootVNode && rootContainer) {
      rootRender();
    }
  }

  function useState(initialState) {
    const index = hookCursor++;
    if (hooks.length <= index) {
      hooks[index] = typeof initialState === 'function' ? initialState() : initialState;
    }
    const setState = (value) => {
      const nextValue = typeof value === 'function' ? value(hooks[index]) : value;
      if (!Object.is(nextValue, hooks[index])) {
        hooks[index] = nextValue;
        rerender();
      }
    };
    return [hooks[index], setState];
  }

  function depsChanged(prevDeps, nextDeps) {
    if (!prevDeps || !nextDeps) {
      return true;
    }
    if (prevDeps.length !== nextDeps.length) {
      return true;
    }
    for (let i = 0; i < prevDeps.length; i += 1) {
      if (!Object.is(prevDeps[i], nextDeps[i])) {
        return true;
      }
    }
    return false;
  }

  function useEffect(effect, deps) {
    const index = effectCursor++;
    const previous = effectStore[index];
    if (depsChanged(previous ? previous.deps : null, deps)) {
      pendingEffects.push({ index, effect, deps });
    }
  }

  function useRef(initialValue) {
    const index = hookCursor++;
    if (!hooks[index]) {
      hooks[index] = { current: initialValue };
    }
    return hooks[index];
  }

  function useMemo(factory, deps) {
    const index = hookCursor++;
    const record = hooks[index];
    if (!record || depsChanged(record.deps, deps)) {
      const value = factory();
      hooks[index] = { value, deps };
      return value;
    }
    return record.value;
  }

  function createRoot(container) {
    return {
      render(vnode) {
        rootVNode = vnode;
        rootContainer = container;
        rootRender = () => renderVNode(rootVNode, rootContainer);
        rootRender();
      },
    };
  }

  return {
    createElement,
    Fragment,
    useState,
    useEffect,
    useMemo,
    useRef,
    createRoot,
  };
})();

export const React = TinyReact;
export const ReactDOM = {
  createRoot: TinyReact.createRoot,
};
