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
      </div>
    </div>
  </div>
)

function render(vdom, container) {
  const dom = vdom.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(vdom.type)

  Object.keys(vdom.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = vdom.props[name]
    })

  vdom.props.children.forEach((child) => {
    render(child, dom)
  })

  container.appendChild(dom)
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

render(elem1, root)
