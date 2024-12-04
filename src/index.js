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

const elem2 = <div className="1" children={<div className="3" children={<div className="2" children={'hello'} />} />} />

const elem3 = createElement(
  'div',
  {className: '1'},
  createElement('div', {className: '3'}, createElement('div', {className: '2'}, 'hello'))
)

const elem4 = <div className="2" children="hello" />

render(elem1)

function render(vdom, deps = 0) {
  delete vdom.props.__self
  delete vdom.props.__source

  console.log(' '.repeat(deps), vdom.props.nodeValue || `${vdom.type} ${vdom.props.className}`)

  vdom.props.children.forEach((child) => {
    render(child, deps + 1)
  })
}

function isIterable(obj) {
  if (!obj) {
    return false
  }

  return typeof obj[Symbol.iterator] === 'function'
}
