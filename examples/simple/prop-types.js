import PropTypes from 'prop-types';

export const orientation = PropTypes.oneOf(['landscape', 'portrait', 'square']);

export const latLng = PropTypes.shape({
  lat: PropTypes.number,
  lng: PropTypes.number,
});

export const linkProps = PropTypes.shape({
  href: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    query: PropTypes.object.isRequired,
  }).isRequired,
  as: {
    pathname: PropTypes.string.isRequired,
  },
});

export const pageRef = {
  title: PropTypes.string.isRequired,
  linkProps: linkProps.isRequired,
};

export const photoMeta = PropTypes.shape({
  aperture: PropTypes.string,
  camera: PropTypes.string,
  createdAt: PropTypes.string,
  description: PropTypes.string,
  exposureTime: PropTypes.number,
  flash: PropTypes.bool,
  focalLength: PropTypes.string,
  gps: latLng,
  iso: PropTypes.number,
  lens: PropTypes.string,
  title: PropTypes.string,
  orientation,
});

export const page = PropTypes.shape({
  meta: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
});

export const image = PropTypes.shape({
  filePath: PropTypes.string.isRequired,
  detailLinkProps: linkProps,
  fileName: PropTypes.string.isRequired,
  meta: photoMeta,
});