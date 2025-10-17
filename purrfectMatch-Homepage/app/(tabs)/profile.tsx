import { StyleSheet, View } from 'react-native'

const profile = () => {
  return (
    <View style={styles.container}>
      
    </View>
  )
}

export default profile

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#333' 
  }
})