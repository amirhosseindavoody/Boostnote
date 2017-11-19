import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './SideNav.styl'
import { openModal } from 'browser/main/lib/modal'
import PreferencesModal from '../modals/PreferencesModal'
import ConfigManager from 'browser/main/lib/ConfigManager'
import StorageItem from './StorageItem'
import TagListItem from 'browser/components/TagListItem'
import SideNavFilter from 'browser/components/SideNavFilter'
import StorageList from 'browser/components/StorageList'
import NavToggleButton from 'browser/components/NavToggleButton'
import EventEmitter from 'browser/main/lib/eventEmitter'

class SideNav extends React.Component {
  // TODO: should not use electron stuff v0.7

  componentDidMount () {
    EventEmitter.on('side:preferences', this.handleMenuButtonClick)
  }

  componentWillUnmount () {
    EventEmitter.off('side:preferences', this.handleMenuButtonClick)
  }

  handleMenuButtonClick (e) {
    openModal(PreferencesModal)
  }

  handleHomeButtonClick (e) {
    let { router } = this.context
    router.push('/home')
  }

  handleStarredButtonClick (e) {
    let { router } = this.context
    router.push('/starred')
  }

  handleToggleButtonClick (e) {
    let { dispatch, config } = this.props

    ConfigManager.set({isSideNavFolded: !config.isSideNavFolded})
    dispatch({
      type: 'SET_IS_SIDENAV_FOLDED',
      isFolded: !config.isSideNavFolded
    })
  }

  handleTrashedButtonClick (e) {
    let { router } = this.context
    router.push('/trashed')
  }

  handleSwitchFoldersButtonClick () {
    const { router } = this.context
    router.push('/home')
  }

  handleSwitchTagsButtonClick () {
    const { router } = this.context
    router.push('/alltags')
  }

  SideNavComponent (isFolded, storageList) {
    let { location, data } = this.props

    const isHomeActive = !!location.pathname.match(/^\/home$/)
    const isStarredActive = !!location.pathname.match(/^\/starred$/)
    const isTrashedActive = !!location.pathname.match(/^\/trashed$/)

    let component

    // TagsMode is not selected
    if (!location.pathname.match('/tags') && !location.pathname.match('/alltags')) {
      component = (
        <div>
          <SideNavFilter
            isFolded={isFolded}
            isHomeActive={isHomeActive}
            handleAllNotesButtonClick={(e) => this.handleHomeButtonClick(e)}
            isStarredActive={isStarredActive}
            isTrashedActive={isTrashedActive}
            handleStarredButtonClick={(e) => this.handleStarredButtonClick(e)}
            handleTrashedButtonClick={(e) => this.handleTrashedButtonClick(e)}
            counterTotalNote={data.noteMap._map.size}
            counterStarredNote={data.starredSet._set.size}
            counterDelNote={data.trashedSet._set.size}
          />

          <StorageList storageList={storageList} />
          <NavToggleButton isFolded={isFolded} handleToggleButtonClick={this.handleToggleButtonClick.bind(this)} />
        </div>
      )
    } else {
      component = (
        <div styleName='tabBody'>
          <div styleName='tag-title'>
            <p>Tags</p>
          </div>
          <div styleName='tagList'>
            {this.tagListComponent(data)}
          </div>
        </div>
      )
    }

    return component
  }

  tagListComponent () {
    const { data, location } = this.props
    let tagList = data.tagNoteMap.map((tag, key) => {
      return key
    })
    return (
      tagList.map(tag => (
        <TagListItem
          name={tag}
          handleClickTagListItem={this.handleClickTagListItem.bind(this)}
          isActive={this.getTagActive(location.pathname, tag)}
          key={tag}
        />
      ))
    )
  }

  getTagActive (path, tag) {
    const pathSegments = path.split('/')
    const pathTag = pathSegments[pathSegments.length - 1]
    return pathTag === tag
  }

  handleClickTagListItem (name) {
    const { router } = this.context
    router.push(`/tags/${name}`)
  }

  render () {
    let { data, location, config, dispatch } = this.props

    let isFolded = config.isSideNavFolded

    let storageList = data.storageMap.map((storage, key) => {
      return <StorageItem
        key={storage.key}
        storage={storage}
        data={data}
        location={location}
        isFolded={isFolded}
        dispatch={dispatch}
      />
    })
    let style = {}
    if (!isFolded) style.width = this.props.width
    const isTagActive = location.pathname.match(/tag/)
    return (
      <div className='SideNav'
        styleName={isFolded ? 'root--folded' : 'root'}
        tabIndex='1'
        style={style}
      >
        <div styleName='top'>
          <div styleName='switch-buttons'>
            <button styleName={isTagActive ? 'non-active-button' : 'active-button'} onClick={this.handleSwitchFoldersButtonClick.bind(this)}>
              <img src={isTagActive
                  ? '../resources/icon/icon-list.svg'
                  : '../resources/icon/icon-list-active.svg'
                }
              />
            </button>
            <button styleName={isTagActive ? 'active-button' : 'non-active-button'} onClick={this.handleSwitchTagsButtonClick.bind(this)}>
              <img src={isTagActive
                  ? '../resources/icon/icon-tag-active.svg'
                  : '../resources/icon/icon-tag.svg'
                }
              />
            </button>
          </div>
          <div>
            <button styleName='top-menu-preference'
              onClick={(e) => this.handleMenuButtonClick(e)}
            >
              <img styleName='iconTag' src='../resources/icon/icon-setting.svg' />
            </button>
          </div>
        </div>
        {this.SideNavComponent(isFolded, storageList)}
      </div>
    )
  }
}

SideNav.contextTypes = {
  router: PropTypes.shape({})
}

SideNav.propTypes = {
  dispatch: PropTypes.func,
  storages: PropTypes.array,
  config: PropTypes.shape({
    isSideNavFolded: PropTypes.bool
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string
  })
}

export default CSSModules(SideNav, styles)
