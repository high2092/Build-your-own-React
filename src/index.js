/** @jsx createElement */

function createElement(type, props, ..._children) {
  const propsChildren =
    typeof props.children === 'string' || !isIterable(props.children)
      ? [props.children].filter(Boolean)
      : props.children

  const children = [..._children, ...propsChildren]

  return {
    type,
    props: {
      ...props,
      children: children.map((child) => (typeof child === 'object' ? child : createTextElement(child))),
    },
  }
}

function createTextElement(text) {
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

function createDom(vdom) {
  const dom = vdom.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(vdom.type)

  updateDom(dom, {}, vdom.props)

  return dom
}

function render(element, container) {
  deletions = []
  nextUnitOfWork = wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  }
}

function isEvent(key) {
  return key.startsWith('on')
}

function isProperty(key) {
  return key !== 'children' && !isEvent(key)
}

function isNew(prev, next) {
  return (key) => prev[key] !== next[key]
}

function isGone(prev, next) {
  return (key) => !(key in next)
}

function isIterable(obj) {
  if (!obj) {
    return false
  }

  return typeof obj[Symbol.iterator] === 'function'
}

const root = document.getElementById('root')

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

;(function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 16
    console.log('work')
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot()
    console.log('commit')
  }

  requestIdleCallback(workLoop)
  console.log('check')
})()

function appendDom(parentDom, dom) {
  parentDom.appendChild(dom)
}

function removeDom(parentDom, dom) {
  parentDom.removeChild(dom)
}

function updateDom(dom, prevProps, nextProps) {
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
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  const domParent = fiber.parent.dom

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    appendDom(domParent, fiber.dom)
  } else if (fiber.effectTag === 'DELETION') {
    removeDom(domParent, fiber.dom)
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
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

function reconcileChildren(wipFiber, elements) {
  let oldFiber = wipFiber.alternate?.child
  let prevSibling = null

  for (let i = 0; i < elements.length || oldFiber; i++) {
    const element = elements[i]

    let newFiber = null

    const isSameType = element && oldFiber && element.type === oldFiber.type

    if (isSameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
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
        deletions.push(oldFiber)
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling
    }

    if (i === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
  }
}

const rerender = (value) => {
  const elem = (
    <div>
      <input
        onInput={(e) => {
          rerender(e.target.value)
        }}
        value={value}
      />
      <h2>Hello, {value}</h2>
    </div>
  )

  render(elem, root)
}

rerender('world')
