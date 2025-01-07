/** @jsx createElement */

type VDOM = {
  type: 'div' | 'TEXT_ELEMENT'
  props: {
    nodeValue?: string
    children?: VDOM[]
  }
}

function createElement(type: VDOM['type'], props: VDOM['props'], ..._children: VDOM[]): VDOM {
  const propsChildren =
    (typeof props.children === 'string' || !isIterable(props.children)
      ? [props.children as unknown as VDOM].filter(Boolean)
      : props.children) || []

  const children = [..._children, ...propsChildren]

  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  }
}

function createTextElement(text: string): VDOM {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  }
}

const elem1 = (
  <div className="1">
    <div className="3">
      <div className="2">
        {'hello'}
        {'hello'}
        <div className="3">
          <div className="2">
            {'hello'}
            {'hello'}
            <div className="3">
              <div className="2">
                {'hello'}
                {'hello'}
                <div className="3">
                  <div className="2">
                    {'hello'}
                    {'hello'}
                    <div className="3">
                      <div className="2">
                        {'hello'}
                        {'hello'}
                      </div>
                    </div>
                    <div className="3">
                      <div className="2">
                        {'hello'}
                        {'hello'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

function createDom(vdom: VDOM) {
  const dom = vdom.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(vdom.type)

  updateDom(dom, {}, vdom.props)

  return dom
}

function render(element: VDOM, container: HTMLElement | null) {
  deletions = []
  nextUnitOfWork = wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
}

function isEvent(key: string) {
  return key.startsWith('on')
}

function isProperty(key: string) {
  return key !== 'children' && !isEvent(key)
}

function isNew(prev: VDOM['props'], next: VDOM['props']) {
  return (key: string) => prev[key] !== next[key]
}

function isGone(prev: VDOM['props'], next: VDOM['props']) {
  return (key: string) => !(key in next)
}

function isIterable(obj?: {[Symbol.iterator]: unknown}): boolean {
  if (!obj) {
    return false
  }

  return typeof obj[Symbol.iterator] === 'function'
}

const root = document.getElementById('root')

let nextUnitOfWork: Fiber | null = null
let currentRoot: Fiber | null = null
let wipRoot: Fiber | null = null
let deletions: Fiber[] | null = null

;(function workLoop(deadline?: IdleDeadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = !!deadline && deadline.timeRemaining() < 16
    console.log('work')
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
    console.log('commit')
  }

  requestIdleCallback(workLoop)
  console.log('check')
})()

function appendDom(parentDom: Text | HTMLElement, dom: Text | HTMLElement) {
  parentDom.appendChild(dom)
}

function removeDom(parentDom: Text | HTMLElement, dom: Text | HTMLElement) {
  parentDom.removeChild(dom)
}

function updateDom(dom: Text | HTMLElement, prevProps: VDOM['props'], nextProps: VDOM['props']) {
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.removeEventListener(eventType, prevProps[name])
    })

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = ''
    })

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name]
    })

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2)
      dom.addEventListener(eventType, nextProps[name])
    })
}

function commitRoot() {
  deletions!.forEach(commitWork)
  commitWork(wipRoot?.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber?: Fiber | null) {
  if (!fiber) {
    return
  }

  const domParent = fiber.parent?.dom

  if (fiber.effectTag === 'PLACEMENT') {
    appendDom(domParent!, fiber.dom!)
  } else if (fiber.effectTag === 'DELETION') {
    removeDom(domParent!, fiber.dom!)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate!.props, fiber.props)
  }

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  reconcileChildren(fiber, fiber.props.children)

  if (fiber.child) {
    return fiber.child
  }

  let nextFiber = fiber

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

interface Fiber {
  type?: VDOM['type']
  props: VDOM['props']
  dom: Text | HTMLElement | null
  parent?: Fiber
  child?: Fiber | null
  sibling?: Fiber
  alternate?: Fiber | null
  effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION'
}

function reconcileChildren(wipFiber: Fiber, elements: VDOM[]) {
  let oldFiber: Fiber | null | undefined = wipFiber.alternate?.child
  let prevSibling: Fiber | null = null

  for (let i = 0; i < elements.length || oldFiber; i++) {
    const element = elements[i]

    let newFiber: Fiber | null = null

    const isSameType = element && oldFiber && element.type === oldFiber.type

    if (isSameType) {
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      }
    } else {
      if (element) {
        newFiber = {
          type: element.type,
          props: element.props,
          parent: wipFiber,
          dom: null,
          alternate: null,
          effectTag: 'PLACEMENT',
        }
      }

      if (oldFiber) {
        oldFiber.effectTag = 'DELETION'
        deletions!.push(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (i === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling!.sibling = newFiber!
    }

    prevSibling = newFiber
  }
}

const rerender = (value: string) => {
  const elem = (
    <div>
      <input
        onInput={(e) => {
          rerender((e.target as HTMLInputElement).value)
        }}
        value={value}
      />
      <h2>Hello, {value}</h2>
    </div>
  )

  render(elem, root)
}

rerender('world')