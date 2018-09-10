import React from 'react'
import { Text, View, TouchableOpacity, Alert, Platform } from 'react-native'
import distanceInWords from 'date-fns/distance_in_words'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ActionSheet from 'react-native-actionsheet'
import { SettingsConsumer } from '../context'
import { Vote } from './vote'
import { getHostFromUrl } from '../utils'

export default class PostItem extends React.PureComponent {
  static defaultProps = {
    hasCommentLink: true,
  }

  ActionSheet = null

  isText = () => {
    return this.props.item.url.startsWith('text://')
  }

  render() {
    const now = Date.now()
    const { item, hasCommentLink, colors } = this.props

    return (
      <View
        style={{
          flexDirection: 'row',
          padding: 10,
        }}
      >
        <SettingsConsumer>
          {({ openLink }) => (
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                onPress={async () => {
                  if (this.isText()) {
                    this.props.navigation.navigate('Detail', item)
                    return
                  }

                  openLink(item.url, colors)
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    lineHeight: 22,
                    color: colors.content.title,
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </Text>
                {this.isText() || (
                  <Text
                    style={{
                      color: colors.content.url,
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    at {getHostFromUrl(item.url)}
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={{ color: colors.content.user, fontSize: 14 }}>
                <Text
                  style={{
                    textDecorationLine: 'underline',
                  }}
                  onPress={() => {
                    openLink(`https://echojs.com/user/${item.username}`, colors)
                  }}
                >
                  {item.username}
                </Text>{' '}
                | {distanceInWords(parseInt(item.ctime, 10) * 1000, now)} ago
              </Text>
            </View>
          )}
        </SettingsConsumer>

        {hasCommentLink && (
          <View
            style={{
              justifyContent: 'space-between',
              width: 44,
              marginTop: 2,
              paddingLeft: 10,
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => {
                if (!this.props.auth) {
                  this.props.navigation.navigate('Login')
                  return
                }

                if (item.voted) {
                  alert(`You already vote ${item.voted}`)
                  return
                }

                this.ActionSheet.show()
              }}
            >
              <Vote colors={colors} item={item} />
              <ActionSheet
                ref={el => {
                  this.ActionSheet = el
                }}
                title={`Vote for ${item.username}'s post`}
                options={['Up', 'Down', 'cancel']}
                cancelButtonIndex={2}
                onPress={async index => {
                  try {
                    switch (index) {
                      case 0:
                        await this.props.voteNews(item.id, 'up')
                        this.props.updateVote(item.id, 'up')
                      case 1:
                        await this.props.voteNews(item.id, 'down')
                        this.props.updateVote(item.id, 'down')
                    }
                  } catch (err) {
                    alert(err.message)
                  }
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, justifyContent: 'flex-end' }}
              onPress={() =>
                this.props.navigation.navigate('Detail', { ...item })
              }
            >
              <View style={{ flexDirection: 'row' }}>
                <MaterialCommunityIcons
                  name="comment-text-outline"
                  size={14}
                  style={Platform.select({
                    ios: { marginRight: 2, marginTop: 2 },
                    android: { marginRight: 3, marginTop: 3 },
                  })}
                  color={colors.content.icon}
                />
                <Text style={{ color: colors.content.icon }}>
                  {item.comments}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }
}
