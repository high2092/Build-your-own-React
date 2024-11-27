function createElement(type, props, ...children) {
  console.log('createElement', type, props.className)
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

/** @jsx createElement */
const element = (
  <div className="1">
    <div className="3">
      <div className="2">hello</div>
    </div>
  </div>
)

console.log(element)
