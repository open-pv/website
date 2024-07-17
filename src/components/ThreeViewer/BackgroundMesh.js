const BackgroundMesh = ({ geometry }) => {
  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial color={0xcccccc} transparent={true} opacity={0.3} />
    </mesh>
  )
}

export default BackgroundMesh
