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

  Object.keys(vdom.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = vdom.props[name]
    })

  return dom
}

function render(element, container) {
  nextUnitOfWork = wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
  }
}

function isProperty(key) {
  return key !== 'children'
}

function isIterable(obj) {
  if (!obj) {
    return false
  }

  return typeof obj[Symbol.iterator] === 'function'
}

const root = document.getElementById('root')

let nextUnitOfWork = null
let wipRoot = null

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

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)

  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  let prevSibling = null

  fiber.props.children.forEach((element, i) => {
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    if (i === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
  })

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

render(elem1, root)
