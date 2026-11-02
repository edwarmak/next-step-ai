import { Link } from 'react-router-dom'
import Icon from '../Icon/Icon'
import './PagePlaceholder.css'

type PagePlaceholderProps = {
  title: string
  description: string
}

function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="placeholder-page" aria-labelledby="placeholder-title">
      <p className="eyebrow">YOUR WORKSPACE</p>
      <h1 className="placeholder-page__title" id="placeholder-title">
        {title}
      </h1>
      <p className="placeholder-page__description">{description}</p>
      <Link className="primary-button placeholder-page__back" to="/">
        Back to dashboard
        <Icon name="arrow-right" />
      </Link>
    </section>
  )
}

export default PagePlaceholder
